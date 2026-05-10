import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, onValue, set, push, remove, update } from "firebase/database";
import { Item, Sale, Customer } from "../types";
import { useAuth } from "./AuthContext";

interface DataContextType {
  items: Item[];
  sales: Sale[];
  customers: Customer[];
  // Item Methods
  addItem: (item: Omit<Item, "id">) => Promise<void>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  // Sale Methods
  addSale: (sale: Omit<Sale, "id">) => Promise<void>;
  // Customer Methods
  addCustomer: (customer: Omit<Customer, "id">) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

// Helper for offline storage
const safeParse = (key: string, _default: any) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : _default;
  } catch (e) {
    return _default;
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>(() => safeParse("hw_items", []));
  const [sales, setSales] = useState<Sale[]>(() => safeParse("hw_sales", []));
  const [customers, setCustomers] = useState<Customer[]>(() => safeParse("hw_customers", []));

  useEffect(() => {
    if (!user) return; // Only sync if logged in

    const itemsRef = ref(db, "items");
    const salesRef = ref(db, "sales");
    const customersRef = ref(db, "customers");

    const unsubItems = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const itemsList = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setItems(itemsList);
      localStorage.setItem("hw_items", JSON.stringify(itemsList));
    });

    const unsubSales = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      const salesList = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setSales(salesList);
      localStorage.setItem("hw_sales", JSON.stringify(salesList));
    });

    const unsubCustomers = onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      const customersList = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setCustomers(customersList);
      localStorage.setItem("hw_customers", JSON.stringify(customersList));
    });

    return () => {
      unsubItems();
      unsubSales();
      unsubCustomers();
    };
  }, [user]);

  // Methods
  const addItem = async (item: Omit<Item, "id">) => {
    const itemsRef = ref(db, "items");
    const newItemRef = push(itemsRef);
    await set(newItemRef, item);
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const itemRef = ref(db, `items/${id}`);
    await update(itemRef, updates);
  };

  const deleteItem = async (id: string) => {
    const itemRef = ref(db, `items/${id}`);
    await remove(itemRef);
  };

  const addSale = async (sale: Omit<Sale, "id">) => {
    const salesRef = ref(db, "sales");
    const newSaleRef = push(salesRef);
    await set(newSaleRef, sale);
    
    // Auto deduct stock
    sale.items.forEach(async (si) => {
      const realId = si.baseItemId || si.itemId;
      const itemToUpdate = items.find(i => i.id === realId);
      if (itemToUpdate) {
          if (si.size && itemToUpdate.quantityVariants) {
              const newVariants = itemToUpdate.quantityVariants.map(v => 
                  v.size === si.size ? { ...v, stock: Math.max(0, v.stock - si.qty) } : v
              );
              await updateItem(realId, { quantityVariants: newVariants });
          } else {
              const newStock = Math.max(0, (itemToUpdate.stock || 0) - si.qty);
              await updateItem(realId, { stock: newStock });
          }
      }
    });

    // Auto update customer info if attached
    if (sale.customerId) {
        const customerToUpdate = customers.find(c => c.id === sale.customerId);
        if (customerToUpdate) {
            await updateCustomer(sale.customerId, {
                totalSpent: (customerToUpdate.totalSpent || 0) + sale.finalAmount,
                visits: (customerToUpdate.visits || 0) + 1,
                lastVisit: new Date().toISOString()
            });
        }
    }
  };

  const addCustomer = async (customer: Omit<Customer, "id">) => {
    const custRef = ref(db, "customers");
    const newCustRef = push(custRef);
    await set(newCustRef, customer);
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const custRef = ref(db, `customers/${id}`);
    await update(custRef, updates);
  };

  return (
    <DataContext.Provider
      value={{
        items,
        sales,
        customers,
        addItem,
        updateItem,
        deleteItem,
        addSale,
        addCustomer,
        updateCustomer,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

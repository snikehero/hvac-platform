import React, { useState, useEffect } from "react";
import { api } from "../services/mockService";

const AllProducts = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await api.getProducts();
      setItems(data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>All Products (Mock)</h1>
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            {p.name} — {p.type} — {p.status} — {p.value} {p.unit || ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllProducts;

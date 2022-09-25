import { useEffect, useState } from "react";

export const useTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000")
      .then(response => {
        setCurrency(response.body);
      })
      .catch(error => {
        console.error("Error:", error);
        setError("Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { currency, loading, error };
};

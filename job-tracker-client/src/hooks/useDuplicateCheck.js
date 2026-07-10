import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export function useDuplicateCheck(companyName, enabled = true) {
  const [duplicate, setDuplicate] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!enabled || !companyName || companyName.trim().length < 2) {
      setDuplicate(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsChecking(true);
      try {
        const response = await api.get(
          `/JobApplications/check-duplicate?companyName=${encodeURIComponent(companyName)}`,
        );
        setDuplicate(response.data.isDuplicate ? response.data.existing : null);
      } catch {
        setDuplicate(null);
      } finally {
        setIsChecking(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [companyName, enabled]);

  return { duplicate, isChecking };
}

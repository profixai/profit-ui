import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface Period {
  year: number;
  month: string;
  granularity: "daily" | "monthly" | "ytd";
}

interface PropertyContextType {
  propertyId: string;
  propertyName: string;
  setProperty: (id: string, name: string) => void;
  period: Period;
  setPeriod: (p: Period) => void;
}

const defaultPeriod: Period = { year: 2024, month: "dec", granularity: "monthly" };

const PropertyContext = createContext<PropertyContextType>({
  propertyId: "le-grand",
  propertyName: "Le Grand Hôtel",
  setProperty: () => {},
  period: defaultPeriod,
  setPeriod: () => {},
});

export const properties = [
  { id: "le-grand", name: "Le Grand Hôtel" },
  { id: "riviera", name: "Riviera Palace" },
  { id: "alpine", name: "Alpine Lodge" },
];

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [propertyId, setPropertyId] = useState("le-grand");
  const [propertyName, setPropertyName] = useState("Le Grand Hôtel");
  const [period, setPeriod] = useState<Period>(defaultPeriod);

  const setProperty = useCallback((id: string, name: string) => {
    setPropertyId(id);
    setPropertyName(name);
  }, []);

  return (
    <PropertyContext.Provider value={{ propertyId, propertyName, setProperty, period, setPeriod }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => useContext(PropertyContext);

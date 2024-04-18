import { useState, useEffect } from "react";
import { Service } from "../interfaces/interfaces";
import { getServices } from "../services/services";
import ServiceCard from "./ServiceCard";
import { Button } from "./Button";
import WorkerCardSkeleton from "./Skeletons/WorkerCardSkeleton";

interface ServicesResultsProps {
  category: string | null;
}

const ServicesResults = ({ category }: ServicesResultsProps) => {
  const [services, setServices] = useState<Service[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [take, setTake] = useState<number>(5);
  const [totalServices, setTotalServices] = useState<number>(0);

  const handleGetServices = async () => {
    try {
      const servicesData = await getServices({
        category,
        take,
      });
      if (!servicesData) return;

      setServices(servicesData.data.services);
      setIsLoading(false);

      setTotalServices(servicesData.data.totalServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    handleGetServices();
  }, [category, take]);

  useEffect(() => {
    setTake(5);
  }, [category]);

  const handleLoadMore = () => {
    setTake((prevTake) => prevTake + 5);
  };

  return (
    <article className="w-full">
      <div className="flex flex-col gap-y-4">
        <h4 className="text-3xl self-start font-semibold">Servicios</h4>
        {isLoading || !services ? (
          <WorkerCardSkeleton />
        ) : (
          <>
            {services.length ? (
              services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            ) : (
              <p>No se han encontrado servicios para esta categoría</p>
            )}
            {!isLoading && totalServices > take && (
              <Button
                onClick={() => handleLoadMore()}
                color="transparent"
                title="Cargar más"
                className="m-auto"
              />
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default ServicesResults;

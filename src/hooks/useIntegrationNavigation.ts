import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useIntegrationNavigation() {
  const navigate = useNavigate();

  const goToTelegramIntegration = useCallback(() => {
    navigate("/settings#telegram");
  }, [navigate]);

  return { goToTelegramIntegration };
}

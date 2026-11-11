import { Component, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { STORAGE_KEY } from "./storage";
import { downloadText } from "./settings";
import { reportError } from "@/lib/analytics";

// Last-resort fallback for unexpected render errors. Only the error goes to analytics (when
// enabled): the save can contain private free text, so the person decides whether to download it.
function savedScenario() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const saved = savedScenario();
    return (
      <main className="prototype-section" role="alert">
        <h1>Coś poszło nie tak</h1>
        <p className="my-5">
          Tego widoku nie udało się wyświetlić. Zapisane dane scenariusza nie zostały zmienione.
          Możesz pobrać ich kopię, odświeżyć stronę albo wrócić na stronę główną.
        </p>
        <div className="record-actions">
          {saved && (
            <Button
              variant="outline"
              onClick={() => downloadText("doroboty-zapis-do-odzyskania.json", saved)}
            >
              Pobierz zapis scenariusza
            </Button>
          )}
          <Button onClick={() => window.location.reload()}>Odśwież stronę</Button>
          <a
            className={buttonVariants({ variant: "outline" })}
            href="#/"
            onClick={() => this.setState({ failed: false })}
          >
            Wróć na stronę główną
          </a>
        </div>
        <p className="record-caption mt-4">
          Jeśli błąd wraca, w ustawieniach możesz zresetować scenariusz do danych początkowych.
        </p>
      </main>
    );
  }
}

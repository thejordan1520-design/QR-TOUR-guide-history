import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Home className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Página no encontrada</CardTitle>
          <p className="text-muted-foreground">
            La página que buscas no existe en el panel de administración.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => navigate('/admin/dashboard')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver atrás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;


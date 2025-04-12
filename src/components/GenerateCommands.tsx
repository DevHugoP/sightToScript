
import { useState, useEffect } from "react";
import { FolderStructure } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { generateScriptCommands } from "@/utils/scriptGenerator";

interface GenerateCommandsProps {
  folderStructure: FolderStructure | null;
}

type ScriptType = "bash" | "powershell" | "cmd";

const GenerateCommands = ({ folderStructure }: GenerateCommandsProps) => {
  const [commandsType, setCommandsType] = useState<ScriptType>("bash");
  const [commands, setCommands] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (folderStructure) {
      generateCommands(commandsType);
    }
  }, [folderStructure, commandsType]);

  const generateCommands = (type: ScriptType) => {
    if (!folderStructure) return;
    
    setIsLoading(true);

    try {
      // Générer les commandes localement, sans appel API
      const generatedCommands = generateScriptCommands(folderStructure, type);
      setCommands(generatedCommands);
    } catch (error) {
      console.error("Error generating commands:", error);
      toast.error("Failed to generate commands. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(commands);
    toast.success("Commands copied to clipboard!");
  };

  if (!folderStructure) {
    return <div>No structure to generate commands from</div>;
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Generate Commands
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={commandsType}
          onValueChange={(value) => setCommandsType(value as ScriptType)}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="bash">Bash (macOS/Linux)</TabsTrigger>
            <TabsTrigger value="powershell">PowerShell</TabsTrigger>
            <TabsTrigger value="cmd">CMD</TabsTrigger>
          </TabsList>

          <TabsContent value={commandsType} className="mt-0">
            <div className="relative">
              <div className="absolute top-2 right-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopyToClipboard}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {isLoading ? (
                <div className="p-4 bg-gray-100 rounded-md text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Generating commands...</p>
                </div>
              ) : (
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[400px] text-sm font-mono whitespace-pre">
                  {commands || "No commands generated yet"}
                </pre>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GenerateCommands;

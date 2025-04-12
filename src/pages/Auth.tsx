
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, signInWithGoogle, signInWithGitHub, signUp } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signInWithEmail(email, password);
        navigate("/");
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else {
        await signInWithGitHub();
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to save your structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleEmailAuth(false)}
                    disabled={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input 
                      id="new-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="new-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleEmailAuth(true)}
                    disabled={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </TabsContent>
              
              <div className="relative mt-6 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn("github")}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;

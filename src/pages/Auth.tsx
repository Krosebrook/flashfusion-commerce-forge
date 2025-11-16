import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password too long"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const onCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const resetCaptcha = () => {
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password });
      setErrors({});
      
      if (!captchaToken) {
        toast({
          title: "Verification required",
          description: "Please complete the captcha verification.",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);

      const redirectUrl = `${window.location.origin}/`;

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken: captchaToken || undefined,
          },
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            captchaToken: captchaToken || undefined,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive",
        });
      }
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={loading}
                className={errors.email ? "border-red-500" : ""}
                maxLength={255}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                disabled={loading}
                className={errors.password ? "border-red-500" : ""}
                maxLength={72}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                onVerify={onCaptchaVerify}
                onError={() => {
                  console.error("hCaptcha error");
                  resetCaptcha();
                }}
                onExpire={resetCaptcha}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
              {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                resetCaptcha();
              }}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

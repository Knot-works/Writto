import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

export default function LoginPage() {
  const { user, profile, loading, profileLoaded, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profileLoaded) {
      if (profile) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, profile, loading, profileLoaded, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen paper-texture">
      {/* Left: Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <PenLine className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl text-primary-foreground">
            Writto
          </span>
        </Link>

        <div className="max-w-md">
          <h1 className="font-serif text-4xl leading-tight text-primary-foreground">
            英語で「書ける」
            <br />
            自分になる。
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/70">
            あなたの目標・興味に合わせたお題で、
            <br />
            実践的なライティング力を身につけましょう。
          </p>
        </div>

        <p className="text-sm text-primary-foreground/40">
          &copy; 2026 Writto. All rights reserved.
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <Link to="/" className="block text-center lg:hidden hover:opacity-80 transition-opacity">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <PenLine className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-3xl">Writto</h1>
            <p className="mt-2 text-muted-foreground">
              英語ライティング学習
            </p>
          </Link>

          <div className="space-y-4">
            <h2 className="text-center font-serif text-2xl">はじめましょう</h2>
            <p className="text-center text-sm text-muted-foreground">
              Googleアカウントでログインして学習を始めましょう
            </p>
          </div>

          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="h-12 w-full gap-3 text-base font-medium"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ログインすることで、
            <a href="/terms" className="underline hover:text-foreground">
              利用規約
            </a>
            と
            <a href="/privacy" className="underline hover:text-foreground">
              プライバシーポリシー
            </a>
            に同意したことになります。
          </p>
        </div>
      </div>
    </div>
  );
}

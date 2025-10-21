"use client"
import { useState} from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sb = createClient();

  const handleLogin = async (e: React.FormEvent) =>{
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
     const{data, error} = await sb.auth.signInWithPassword({email, password})
     if (error){
      setError(error.message)
     }
     else{
      console.log(data)

     }
    } catch (error) {
     setError('An unexpected error occured');
    }finally{
      setLoading(false);
    }
  }
    


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F5E6D3] to-[#E8D5B7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-sm bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold text-[#8B4513] mb-2"
              style={{ fontFamily: 'var(--font-pacifico)' }}
            >
              Admin Panel
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[#A0522D] text-lg"
              style={{ fontFamily: 'var(--font-tangerine)' }}
            >
              Welcome back to FuzzyLoopz
            </motion.p>
          </div>

          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[#8B4513] font-medium text-sm block">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0522D] h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD853F]/50 focus:border-[#CD853F] transition-all duration-200 text-[#8B4513] placeholder-[#A0522D]/60"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[#8B4513] font-medium text-sm block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0522D] h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD853F]/50 focus:border-[#CD853F] transition-all duration-200 text-[#8B4513] placeholder-[#A0522D]/60"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0522D] hover:text-[#8B4513] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-[#A0522D]">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-[#CD853F] text-[#CD853F] focus:ring-[#CD853F]/50"
                />
                Remember me
              </label>
              <a href="#" className="text-[#CD853F] hover:text-[#8B4513] font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#CD853F] to-[#D2B48C] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#CD853F]/50"
              onClick={handleLogin}
            >
              Sign In
            </motion.button>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 pt-6 border-t border-white/20"
          >
            <div className="text-center">
              <p className="text-[#A0522D] text-sm">
                Need help? Contact{" "}
                <a href="#" className="text-[#CD853F] hover:text-[#8B4513] font-medium transition-colors">
                  support
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-[#A0522D]/80 text-xs">
            © 2024 FuzzyLoopz. All rights reserved.
          </p>
        </motion.div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#CD853F]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#D2B48C]/15 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#F4A460]/10 rounded-full blur-lg"></div>
      </div>
    </div>
  );
}
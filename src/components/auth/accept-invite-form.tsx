'use client'
import { useState , useTransition } from "react"
import {Eye ,EyeOff , Lock, UserStar} from "lucide-react"
import { acceptInvite } from "@/actions/auth.actions"
export function AcceptInviteFrom({token}: {token:string}){
    const [pending , startTransition] = useTransition() ;
    const [error ,setError] = useState("") ;
    const [name ,setName] = useState("") ;
    const [password ,setPassword] = useState("") ;
    const [confirm ,setConfirm] = useState("") ;
    const [showPass ,setShowPass] = useState(false) ;
    const strength = password.length ===0 ?0 
                     :password.length<6 ?1 
                     :password.length<10 ?2
                     :/[A-Z]/.test(password)&&/[0-9]/.test(password)?4 
                     :3 ;

    const  strengthLabel = ["" , "Weak" , "Fair" , "Good" , "Strong"] ;
    const strengthColor = ["" , "bg-red-500" , "bg-amber-500" , "bg-blue-500" , "bg-emerald-500"] ;
    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault() ;
        if(password !== confirm) {
            setError("Passwords do not match") ;
            return ;
        }
        if(password.length<8){
            setError("Password must be at least 8 characters") 
            return  ;
        }

        const fd = new FormData() ;
        fd.set("token" , token) ;
        fd.set("name" , name) ;
        fd.set("password" , password) ;
        setError("") 
        startTransition(async() =>{
            const res = await acceptInvite(null ,fd) ;
            if(!res?.success)setError(res?.error??"Something went  wrong") ;

        }) ;

    }   
    
     return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Your Name *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="John Doe"
          className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
 
      {/* Password */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Set Password *
        </label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
            className="w-full text-sm pl-9 pr-10 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
 
        {/* Password strength */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= strength ? strengthColor[strength] : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Strength: <span className="font-medium">{strengthLabel[strength]}</span>
            </p>
          </div>
        )}
      </div>
 
      {/* Confirm password */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Repeat password"
            className={`w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border bg-background outline-none focus:ring-2 transition-all ${
              confirm && confirm !== password
                ? "border-red-400 focus:ring-red-400/20"
                : "border-border focus:ring-primary/20 focus:border-primary"
            }`}
          />
        </div>
        {confirm && confirm !== password && (
          <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>
 
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
 
      <button
        type="submit"
        disabled={pending || !name || !password || password !== confirm}
        className="w-full text-sm px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Creating account..." : "Join Organization →"}
      </button>
    </form>
  );
}
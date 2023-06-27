import { InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    name: string;
}

export function Input({ className, ...props}: InputProps) {
    const { register } = useFormContext()

    return (
        <input 
            id={props.name}
            className={`flex-1 rounded border border-zinc-300 shadow-sm px-3 py-2 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${className}`}
            {...register(props.name)}
            {...props}
          />
    )
}
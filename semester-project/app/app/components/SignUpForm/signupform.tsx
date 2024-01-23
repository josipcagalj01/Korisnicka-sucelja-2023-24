'use client'
import Link from 'next/link'
import * as z from 'zod'
import React from 'react'
import {useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import {useRouter} from 'next/navigation'
import './signUpFormStyle.css'
import { useState } from "react";
import Loading from '../Loading/loading'
import { useSession } from 'next-auth/react'
import BorderedLink from '../BorderedLink/button'

interface serverResponse {
  user: any,
  message: string
}

const formSchema = z.object({
    pin: z.string().min(1,'Potrebno je unijeti OIB').regex(/^\d+$/, 'OIB mora sadržavati samo znamenke').min(11, 'OIB sadrži točno 11 znamenaka!').max(12, 'OIB sadrži točno 11 znamenaka!'),
    name: z.string().min(1, 'Potrebno je upisati ime').max(100),
    surname: z.string().min(1, 'Potrebno je upisati prezime').max(100),
    address: z.string().min(1, 'Potrebno je upisati adresu prebivališta').max(100),
    username: z.string().min(1, 'Potrebno je upisati korisničko ime').max(100),
    email: z.string().min(1, 'Potrebno je upisati adresu e-pošte').email('Neispravno upisana adresa-e pošte'),
    password: z.string().min(1,'Potrebno je unijeti lozinku').min(7, 'Lozinka mora imati barem 8 znakova'),
    confirmPassword: z.string().min(1,'Potrebno je ponovno unijeti lozinku')
  })
  .refine((data)=>data.password===data.confirmPassword, {path: ['confirmPassword'], message: 'Lozinka nije točna'})
  
  const SignUpForm = () => {
    const session = useSession()
    if(session.data) window.location.href= '/'

    const [signUpFailed, setIfSignUpFailed] = useState(false)
    const [serverMessage,setServerMessage] = useState('')
    const [signUpAttemptOccurred, setSignUpAttemptOccurred] = useState(false)
    const [loading, isLoading] = useState(false)
    const router = useRouter()
    const { register, handleSubmit, reset, formState: {errors}} = useForm<z.infer<typeof formSchema>>({resolver: zodResolver(formSchema), defaultValues: {pin:'', name:'', surname:'', address:'', username: '', email: '', password: '', confirmPassword: ''}})
  
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      isLoading(true)
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          surname: values.surname,
          address: values.address,
          pin: values.pin,
          username: values.username,
          email: values.email,
          password: values.password
        })
      })
      reset()
      const message:serverResponse = (await response.json())
      isLoading(false)
      setServerMessage(message.message)
      if(response.ok) {
        router.push('/prijava')
        setSignUpAttemptOccurred(true)
      } else {
          console.error('Registracija nije moguća')
          setIfSignUpFailed(true)
          setSignUpAttemptOccurred(true)
          }
    }
  
    return (
      <>
        <div className='formContainer'>
          <form onSubmit={handleSubmit(onSubmit)} className='signUpForm'>
            <h3>Registracija</h3>
            {loading && <Loading message='Izrada korisničkog računa u tijeku ...'/>}
            {!signUpFailed && signUpAttemptOccurred && <b className='formOkMessage'>{serverMessage} Pričekajte da Vas preusmjerimo na stranicu za prijavu</b>}
            {signUpFailed && <b className='formErrorMessage'>{serverMessage}</b>}
            <label htmlFor='pin'>OIB</label>
            <input type='text' {...register('pin')}/>
            {errors.pin && <b className='formErrorMessage'>{errors.pin.message}</b>}
            <label htmlFor='name'>Ime</label>
            <input type='text' {...register('name')}/>
            {errors.name && <b className='formErrorMessage'>{errors.name.message}</b>}
            <label htmlFor='surname'>Prezime</label>
            <input type='text' {...register('surname')}/>
            {errors.surname && <b className='formErrorMessage'>{errors.surname.message}</b>}
            <label htmlFor='address'>Adresa prebivališta</label>
            <input type='text' {...register('address')}/>
            {errors.address && <b className='formErrorMessage'>{errors.address.message}</b>}
            <label htmlFor='username'>Korisničko ime</label>
            <input type='text' {...register('username')}/>
            {errors.username && <b className='formErrorMessage'>{errors.username.message}</b>}
            <label htmlFor='email'>Adresa e-pošte</label>
            <input type='text' {...register('email')}/>
            {errors.email && <b className='formErrorMessage'>{errors.email.message}</b>}
            <label htmlFor='password'>Lozinka</label>
            <input type='password' {...register('password')}/>
            {errors.password && <b className='formErrorMessage'>{errors.password.message}</b>}
            <label htmlFor='confirmPassword'>Ponovo unesite lozinku</label>
            <input type='password' {...register('confirmPassword')}/>
            {errors.confirmPassword && <b className='formErrorMessage'>{errors.confirmPassword.message}</b>}
            <button type='submit' onClick={()=>{signUpFailed && setIfSignUpFailed(false); signUpAttemptOccurred && setSignUpAttemptOccurred(false)}} className='signUpButton'>Registracija</button>
          </form>
          <div className='loginLinkContainer'>
            <p>Već imate korisnički račun?</p>
            <BorderedLink href='/prijava'>Prijava</BorderedLink>
          </div>
        </div>
      </>
  );
}
  
  export default SignUpForm; 
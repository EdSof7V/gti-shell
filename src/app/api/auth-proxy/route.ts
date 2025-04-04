// app/api/auth-proxy/route.js (para App Router)
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await axios.post(
      'https://acloud-br-gcp-gob-ti-auth-1028436318023.southamerica-west1.run.app/auth/token',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: 'Error desconocido' };
    
    return NextResponse.json(data, { status });
  }
}
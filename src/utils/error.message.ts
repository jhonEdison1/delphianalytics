import { MiExcepcionPersonalizada } from "./exception";

export function handleDbError(error: any): string {

  if (error.code === 'ER_DUP_ENTRY') {   
    throw new MiExcepcionPersonalizada('El registro que intentas insertar ya existe', 409);
  }
  if (error.status == '409') {    
    console.log('error.response.mensaje', error.response)
    throw new MiExcepcionPersonalizada(error.response.message, 409);
  }
  if (error.status == '430') {    
    throw new MiExcepcionPersonalizada(error.response.mensaje, 400);    
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new MiExcepcionPersonalizada('El registro que intentas eliminar no existe', 404);
  }
  else {   
    throw new MiExcepcionPersonalizada('Error en la base de datos', 500);
  }
}


// "status": 430,
//     "message": "Mi Excepcion Personalizada",
//     "name": "MiExcepcionPersonalizada"

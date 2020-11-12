import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultaCepService {

  constructor(private httpClient: HttpClient) { }

  consultaCep(cep: string) {

    // Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');

    // Verifica se campo cep possui valor informado.
    if (cep != '') {
      // Expressão regular para validar o CEP.
      const validacep = /^[0-9]{8}$/;

      if (validacep.test(cep)) {
        return this.httpClient.get(`//viacep.com.br/ws/${cep}/json/`);

      }
    }

    return of ({});

  }


}

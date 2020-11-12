import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent implements OnInit {

  usuario: any = {
    nome: null,
    email: null
  };

  constructor(
    private http: HttpClient,
    private consultaCepService: ConsultaCepService
    ) { }

  ngOnInit() {
    // console.log(this.usuario);
  }

  onSubmit(formulario) {
    console.log(formulario);

    this.http.post('https://httpbin.org/post', JSON.stringify(formulario.value))
      .subscribe(dados => {
        console.log(dados);
        formulario.form.reset();
      });
  }

  verificaValidTouched(campo) {
    return !campo.valid && campo.touched;
  }

  aplicaCssErro(campo) {

    return {
      'has-error': this.verificaValidTouched(campo),
      'has-feedback': this.verificaValidTouched(campo)
    };
  }
  consultaCep(cep, form) {
    // Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');
    this.consultaCepService.consultaCep(cep)
        .subscribe(dados => this.popularDadosForm(dados, form));

  }

  popularDadosForm(dados, formulario) {
    formulario.form.patchValue({
      endereco: {
        rua: dados.logradouro,
        //cep: dados.cep,
        numero: '',
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf
      }
    });
  }

  resetaDadosForm(formulario) {
    formulario.form.patchValue({
      endereco: {
        rua: null,
        numero: '',
        complemento: null,
        bairro: null,
        cidade: null,
        estado: null
      }

    });
  }
}

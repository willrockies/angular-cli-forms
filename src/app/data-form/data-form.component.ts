import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, empty, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { BaseFormComponent } from '../shared/base-form/base-form.component';
import { FormValidations } from '../shared/form-validations';
import { Cidade } from '../shared/models/cidade';
import { EstadoBr } from '../shared/models/estado-br.model';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';
import { DropdownService } from '../shared/services/dropdown.service';
import { VerificaEmailService } from './services/verifica-email.service';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent extends BaseFormComponent implements OnInit {

  // formulario: FormGroup;
  estados: EstadoBr[];
  cidades: Cidade[];
  // estados: Observable<EstadoBr[]>;
  cargos: any[];
  tecnologias: any[];
  newsletterOp: any[];
  frameworks = ['Angular', 'React', 'Vue', 'Sencha'];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dropdownservice: DropdownService,
    private consultaCepService: ConsultaCepService,
    private verificaEmailService: VerificaEmailService
  ) {
    super();
  }

  ngOnInit() {

    // this.verificaEmailService.verificarEmail('email@email.com').subscribe();
    // this.estados = this.dropdownservice.getEstadosBr();
    /* this.dropdownservice.getEstadosBr().subscribe(dados => this.estados = dados); */
    /*   this.formulario = new FormGroup({
        nome: new FormControl(null),
        email: new FormControl(null)
      }); */
    this.dropdownservice.getEstadosBr().subscribe(dados => this.estados = dados);
    this.cargos = this.dropdownservice.getCargos();
    this.tecnologias = this.dropdownservice.getTecnologias();
    this.newsletterOp = this.dropdownservice.getNewsletter();

    this.formulario = this.formBuilder.group({
      nome: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email], [this.validarEmail.bind(this)]],
      confirmarEmail: [null, [FormValidations.equalsTo('email')]],

      endereco: this.formBuilder.group({
        cep: [null, [Validators.required, FormValidations.cepValidator]],
        numero: [null, [Validators.required]],
        rua: [null, [Validators.required]],
        complemento: [null],
        bairro: [null, [Validators.required]],
        cidade: [null, [Validators.required]],
        estado: [null, [Validators.required]]
      }),
      cargo: [null],
      tecnologias: [null],
      newsletter: ['s'],
      termos: [null, [Validators.pattern('true')]],
      frameworks: this.buildFrameworks()
    });

    this.formulario.get('endereco.cep').statusChanges
      .pipe(
        distinctUntilChanged(),
        tap(value => console.log('Valor CEP: ', value)),
        switchMap(status => status === 'VALID'
          ? this.consultaCepService.consultaCep(this.formulario.get('endereco.cep').value)
          : EMPTY
        )
      )
      .subscribe(dados => dados ? this.popularDadosForm(dados) : {});

    this.dropdownservice.getCidades(8).subscribe(console.log);

    this.formulario.get('endereco.estado').valueChanges
      .pipe(
        tap(estado => console.log('Novo Estado: ', estado)),
        map (estado => this.estados.filter(e => e.sigla === estado)),
        map(estados => estados && estados.length > 0
          ? estados[0].id
          : EMPTY),
        switchMap((estadoId: number) => this.dropdownservice.getCidades(estadoId)),
        tap(console.log)
      )
      .subscribe(cidades => this.cidades = cidades);
  }

  buildFrameworks() {
    const values = this.frameworks.map(v => new FormControl(false));
    return this.formBuilder.array(values, FormValidations.requiredMinCheckbox(1));
  }
  submit() {
    console.log(this.formulario);

    let valueSubmit = Object.assign({}, this.formulario.value);

    valueSubmit = Object.assign(valueSubmit, {
      frameworks: valueSubmit.frameworks
        .map((v, i) => v ? this.frameworks[i] : null)
        .filter(v => v !== null)
    });

    console.log(valueSubmit);
    this.http.post('https://httpbin.org/post', JSON.stringify(valueSubmit))
      .subscribe(dados => {
        console.log(dados);
        //Resetar o form
        // this.formulario.reset();

      },
        (error: any) => alert('erro'));
  }

  consultaCep() {
    let cep = this.formulario.get('endereco.cep').value;
    // Nova variável "cep" somente com dígitos.

    if (cep != null && cep !== '') {
      this.consultaCepService.consultaCep(cep)
        .subscribe(dados => this.popularDadosForm(dados));
    }

  }

  popularDadosForm(dados) {
    this.formulario.patchValue({
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
  resetaDadosForm() {
    this.formulario.patchValue({
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
  setarCargo() {
    const cargo = { nome: 'Dev', nivel: 'Pleno', desc: 'Dev Pl' };
    this.formulario.get('cargo').setValue(cargo);
  }

  compararCargo(obj1, obj2) {
    return obj1 && obj2
      ? (obj1.nome === obj2.nome && obj1.nivel === obj2.nivel)
      : obj1 === obj2;
  }

  setarTecnologias() {
    // const tecnologia = {nome: 'java', desc: 'Java'}
    this.formulario.get('tecnologias').setValue(['Java', 'javascript', 'php']);
  }

  validarEmail(formControl: FormControl) {
    return this.verificaEmailService.verificarEmail(formControl.value)
      .pipe(map(emailExiste => emailExiste ? { emailInvalid: true } : null))
  }
}

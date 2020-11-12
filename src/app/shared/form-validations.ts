import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { throwError } from 'rxjs';

export class FormValidations {
  static requiredMinCheckbox(min = 1) {
    const validator = (formArray: FormArray) => {
      // opção com Programação estruturada
      /* const values = formArray.controls;
      let totalChecked = 0;
      for (let i = 0; i < values.length; i++) {
        if (values[i].value) {
          totalChecked += 1;
        }
      } */

      // opção com programação funcional
      const totalChecked = formArray.controls
        .map(v => v.value)
        .reduce((total, current) => current ? total + current : total, 0);

      return totalChecked >= min ? null : { required: true };
    };

    return validator;

  }

  static cepValidator(control: FormControl) {

    const cep = control.value;

    if (cep && cep !== '') {
      const validaCep = /^[0-9]{8}$/;
      return validaCep.test(cep) ? null : { cepInvalid: true };
    }
    return null;
  }

  static equalsTo(otherField: string) {
    const validator = (formControl: FormControl) => {
      if (otherField == null) {
        throw new Error('É necessario informar um campo.');
      }

      if (!formControl.root || !(<FormGroup>formControl.root).controls) {
        return null;
      }

      const field = (<FormGroup>formControl.root).get(otherField);

      if (!field) {
        throw new Error('É necessário informar um campo válido.');
      }
      if (field.value !== formControl.value) {
        return { equalTo: otherField };
      }

      return null;
    };
    return validator;
  }

  static getErrorMsg(fieldName: string, validatorName: string, validatorValue?: any) {
    const config = {
      'required': `${fieldName} é obrigatório.`,
      'minlength': `${fieldName} precisa ter no mínimo ${validatorValue.requiredLength} caracteres`,
      'maxlength': `${fieldName} precisa ter no máximo ${validatorValue.requiredLength} caracteres`,
      'cepInvalido': `CEP Invalido`,
    };

    return config[validatorName];
  }
}

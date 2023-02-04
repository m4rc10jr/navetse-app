import { get } from 'lodash';

export default {
  data: () => ({
    validationKey: 'form',
    scopeErrors: {}
  }),

  computed: {
    watchErrorMessages() {
      return (column, attribute = null, options = {}) => {

        let v = this.$v[this.validationKey];

        if (/\w+\.\d{1,}\.\w+/.test(column)) {
          const [parent, index, child, ...iter] = column.split('.');

          v = parent === 'self' ? v.$each :  v[parent].$each;

          column = `${index}.${child}`;

          if (iter.length > 0) {
            v = v[index][child].$each;

            column = `${iter[0]}.${iter[1]}`
          }
        }

        const input = get(v, column);

        const errors = [];

        if (!input || !input.$dirty) {
          this.scopeErrors[column] = errors;
          return errors;
        }

        for (let [rule, value] of Object.entries(input.$params)) {
          !input[rule] && errors.push(
            options?.message ?? this.$validationMessage(attribute ?? column, {
              ...value,
              ...options
            })
          )
        }

        this.scopeErrors[column] = errors;

        return errors;
      }
    },
  }
}

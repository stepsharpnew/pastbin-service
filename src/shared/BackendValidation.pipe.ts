import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform } from "@nestjs/common";
import { validate, ValidationError } from "class-validator";

export class BackendValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!metadata.metatype || !this.isClass(metadata.metatype)) {
            // Если метатип отсутствует или это не класс, просто возвращаем значение
            return value;
        }

        const object = new metadata.metatype(); // Создаем экземпляр класса
        Object.assign(object, value); // Копируем значения из `value` в созданный объект

        const errors = await validate(object);

        if (errors.length === 0) {
            return value;
        }

        throw new HttpException(
            { errors: this.formatErrors(errors) },
            HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    private isClass(metatype: any): boolean {
        // Проверяем, является ли `metatype` функцией и имеет ли он конструктор
        return typeof metatype === 'function' && metatype.prototype;
    }

    private formatErrors(errors: ValidationError[]) {
        // Преобразуем ошибки в удобный формат
        return errors.reduce((acc, error) => {
            acc[error.property] = Object.values(error.constraints || {});
            return acc;
        }, {});
    }
}

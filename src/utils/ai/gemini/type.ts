import { SchemaType, Schema, FunctionDeclaration } from '@google/generative-ai';
export enum Types {
	String = SchemaType.STRING,
	Number = SchemaType.NUMBER,
	Int = SchemaType.INTEGER,
	Boolean = SchemaType.BOOLEAN,
	Object = SchemaType.OBJECT,
	Enum = SchemaType.STRING,
	Array = SchemaType.ARRAY,
}

class value {
	name: string;
	type?: Types;
	required?: boolean;
	showName: boolean;
	constructor(name: string, required?: boolean, showName?: boolean) {
		this.name = name;
		this.required = required;
		this.showName = showName || false;
	}
	toString() {
		return `${this.showName ? `"${this.name}" :` : ''} {
      "type": "${this.type}"
    }`;
	}
}

/**
 * Represents an object schema with properties and validation rules.
 * Extends the base value class to provide object-specific functionality.
 *
 * @class GObject
 * @extends value
 *
 * @example
 * ```typescript
 * const userObject = new GObject('user', true, {
 *   properties: [
 *     new GString('name', true),
 *     new GNumber('age', false)
 *   ],
 *   showName: true
 * });
 * ```
 */
export class GObject extends value {
	type = Types.Object;
	properties: value[];
	showName: boolean;
	constructor(
		name: string,
		required = false,
		objectOptions: { properties?: value[]; showName?: boolean },
	) {
		super(name, required);
		this.properties = objectOptions.properties || [];
		this.showName =
			objectOptions.showName === undefined ? true : objectOptions.showName;
	}
	addProperty(property: value) {
		this.properties.push(property);
		return this;
	}
	removeProperty(name: string) {
		this.properties = this.properties.filter(
			(property) => property.name !== name,
		);
		return this;
	}
	toString() {
		const requiredProperties = this.properties.filter(
			(property) => property.required,
		);
		return `${this.showName ? `"${this.name}" :` : ''}{
      "type": "${this.type}",
      "properties": {
        ${this.properties.map((property) => property.toString()).join(',')}
      }
      ${
				requiredProperties.length > 0
					? `,"required": [${requiredProperties
							.map((property) => `"${property.name}"`)
							.join(',')}]`
					: ''
			}
      }`;
	}
	toSchema() {
		const requiredProperties = this.properties.filter(
			(property) => property.required,
		);
		const data = `${this.showName ? `"${this.name}" :` : ''}{
      "type": "${this.type}",
      "properties": {
        ${this.properties.map((property) => property.toString()).join(',')}
      }
      ${
				requiredProperties.length > 0
					? `,"required": [${requiredProperties
							.map((property) => `"${property.name}"`)
							.join(',')}]`
					: ''
			}
      }`;
		const schema: Schema = JSON.parse(data.trim());
		return schema;
	}
}

export class GArray extends value {
	type = Types.Array;
	item?: value;
	constructor(name: string, required?: boolean, item?: value) {
		super(name, required, true);
		if (item) {
			this.item = item;
		}
	}
	setItem(item: value) {
		this.item = item;
		return this;
	}
	toString() {
		if (!this.item) {
			throw new Error('Array items is required');
		}
		this.item.showName = false;
		return `${this.showName ? `"${this.name}" :` : ''} {
      "type": "${this.type}",
      "items": ${this.item.toString()}
    }`;
	}
}

export class GString extends value {
	type = Types.String;
	constructor(name: string, required?: boolean) {
		super(name, required, true);
	}
}

export class GNumber extends value {
	type = Types.Number;
	constructor(name: string, required?: boolean) {
		super(name, required, true);
	}
}

export class GInt extends value {
	type = Types.Int;
	constructor(name: string, required?: boolean) {
		super(name, required, true);
	}
}

export class GBoolean extends value {
	type = Types.Boolean;
	constructor(name: string, required?: boolean) {
		super(name, required, true);
	}
}

export class GEnum extends value {
	type = Types.Enum;
	values: string[];
	/*
	 * @param name - The name of the enum.
	 * @param values - The values of the enum.
	 * @param required - Whether the enum is required or not.
	 */
	constructor(name: string, values: string[], required?: boolean) {
		super(name, required, true);
		this.values = values;
	}
	addValue(value: string) {
		this.values.push(value);
		return this;
	}
	removeValue(value: string) {
		this.values = this.values.filter((v) => v !== value);
		return this;
	}
	toString() {
		return `"${this.name}": {
      "type": "${this.type}",
      "enum": ${JSON.stringify(this.values)}
    }`;
	}
}

export const beautyJSON = (json: string) =>
	JSON.stringify(JSON.parse(json), null, 2);

export class functionDeclaration {
	name: string;
	parameters: value[];
	description: string;
	/*
	 * @param name - The name of the function.
	 * @param description - A brief description of the function.
	 * @param parameters - An array of parameters for the function.
	 */
	constructor(name: string, description: string, parameters?: value[]) {
		this.name = name;

		this.description = description;
		this.parameters = parameters || [];
	}
	addParameter(parameter: value) {
		this.parameters.push(parameter);
		return this;
	}
	toString() {
		return `{
			"name": "${this.name}",
			"description": "${this.description}",
			"parameters": {
				${new GObject('parameters', false, {
					properties: this.parameters,
					showName: false,
				}).toString()}
			},
			"description": "${this.description}"
		}`;
	}
	toFunctionDeclaration() {
		const data = `{
			"name": "${this.name}",
			"description": "${this.description}",
			"parameters": {
				${new GObject('parameters', false, {
					properties: this.parameters,
					showName: false,
				}).toString()}
			},
			"description": "${this.description}"
		}`;
		const functionDeclaration: FunctionDeclaration = JSON.parse(data);
		return functionDeclaration;
	}
}

export class G {
	static object(...args: ConstructorParameters<typeof GObject>) {
		return new GObject(...args);
	}
	static array(...args: ConstructorParameters<typeof GArray>) {
		return new GArray(...args);
	}
	static string(...args: ConstructorParameters<typeof GString>) {
		return new GString(...args);
	}
	static number(...args: ConstructorParameters<typeof GNumber>) {
		return new GNumber(...args);
	}
	static int(...args: ConstructorParameters<typeof GInt>) {
		return new GInt(...args);
	}
	static boolean(...args: ConstructorParameters<typeof GBoolean>) {
		return new GBoolean(...args);
	}
	static enum(...args: ConstructorParameters<typeof GEnum>) {
		return new GEnum(...args);
	}
	static functionDeclaration(
		...args: ConstructorParameters<typeof functionDeclaration>
	) {
		return new functionDeclaration(...args);
	}
}

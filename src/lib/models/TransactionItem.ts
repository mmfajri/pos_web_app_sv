export class TransactionItem {
	departement: string = '';
	category: string = '';
	description: string = '';
	quantity: number = 0;
	price: number = 0;

	// THIS IS THE LONG WAY
	// constructor({ departement, category, description, quantity, price }: { departement: string, category: string, description: string, quantity: number, price: number }) {
	// 	this.departement = departement;
	// 	this.category = category;
	// 	this.description = description;
	// 	this.quantity = quantity;
	// 	this.price = price
	// }

	constructor(init?: Partial<TransactionItem>) {
		Object.assign(this, init);
	}

	get amount(): number {
		return parseFloat((this.quantity * this.price).toFixed(2));
	}
}



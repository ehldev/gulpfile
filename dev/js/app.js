class User {
	constructor(username) {
		this.username = username
	}

	getUsername() {
		return this.username
	}
}

const user1 = new User('coderick')

console.log(user1.getUsername())
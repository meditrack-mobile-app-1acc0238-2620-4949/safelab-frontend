export class Recipient {
    constructor({
                    id,
                    userId,
                    fullName,
                    email,
                    phone,
                    role,
                    shift,
                    isAvailable = true
                }) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.shift = shift;
        this.isAvailable = isAvailable;
    }
}
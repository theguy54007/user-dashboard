import { UserAbstract } from "./user.abstract";

export class User extends UserAbstract {
  constructor(
    data: Partial<UserAbstract>
  ) {
    super()
    Object.assign(this, data)
  }

  get isOauth() {
    // if (!this.oauths) return false
    return this.oauths.length > 0
  }
}

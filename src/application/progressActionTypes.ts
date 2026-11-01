import { UserData } from "../domain/models/user";

export type UpdateAndPersist = (updater: (previous: UserData) => UserData) => void;

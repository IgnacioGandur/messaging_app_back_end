import groupsModel from "../../../../db/group.js";

export default async function checkIfGroupExistsById(id: string | number) {
    const group = await groupsModel.getById(id);

    if (!group) {
        throw new Error(`The group with and id of: '${id}' doesn't exist.`);
    }

    return true;
}

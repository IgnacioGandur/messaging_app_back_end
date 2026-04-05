type Object = {
    [key: string]: string | undefined | null;
};

const cleanEmptyFields = (object: Object) => {
    return Object.fromEntries(
        Object.entries(object).filter(
            ([, value]) =>
                value !== "" && value !== undefined && value !== null,
        ),
    );
};

export default cleanEmptyFields;

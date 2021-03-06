const { Provider } = require('discord-akairo');

/**
 * Provider using the `typeorm` library.
 * @param {Repository} repository - A typeorm repository.
 * @param {ProviderOptions} [options={}] - Options to use.
 * @extends {Provider}
 */
class TypeORMProvider extends Provider {
    constructor(repository, { idColumn = 'id', dataColumn } = {}) {
        super();

        /**
         * TypeORM repository.
         * @type {Repository}
         */
        this.repository = repository;

        /**
         * Column for ID.
         * @type {string}
         */
        this.idColumn = idColumn;

        /**
         * Column for JSON data.
         * @type {?string}
         */
        this.dataColumn = dataColumn;
    }

    /**
     * Initializes the provider.
     * @returns {Bluebird<void>}
     */
    async init() {
        const rows = await this.repository.find();
        for (const row of rows) {
            this.items.set(row[this.idColumn], this.dataColumn ? row[this.dataColumn] : row);
        }
    }

    /**
     * Gets a value.
     * @param {string} id - ID of entry.
     * @param {string} key - The key to get.
     * @param {any} [defaultValue] - Default value if not found or null.
     * @returns {any}
     */
    get(id, key, defaultValue) {
        if (this.items.has(id)) {
            const value = this.items.get(id)[key];
            return value == null ? defaultValue : value;
        }

        return defaultValue;
    }

    /**
     * Sets a value.
     * @param {string} id - ID of entry.
     * @param {string} key - The key to set.
     * @param {any} value - The value.
     * @param {object} defaultData - The default json to create if it doesn't exist.
     * @returns {Bluebird<boolean>}
     */
    set(id, key, value, defaultData = {}) {
        const data = this.items.get(id) || defaultData;
        data[key] = value;
        this.items.set(id, data);

        if (this.dataColumn) {
            return this.repository.save({
                [this.idColumn]: id,
                [this.dataColumn]: data
            }).then(entity => {
                return entity[this.dataColumn][key] === value;
            });
        }

        return this.repository.save({
            [this.idColumn]: id,
            ...data
        }).then(entity => {
            return entity[key] === value;
        });
    }

    /**
     * Deletes a value.
     * @param {string} id - ID of entry.
     * @param {string} key - The key to delete.
     * @returns {Bluebird<boolean>}
     */
    delete(id, key) {
        const data = this.items.get(id) || {};
        delete data[key];

        if (this.dataColumn) {
            return this.repository.save({
                [this.idColumn]: id,
                [this.dataColumn]: data
            }).then(entity => {
                return !entity[this.dataColumn].hasOwnProperty(key);
            });
        }

        return this.repository.save({
            [this.idColumn]: id,
            [key]: null
        }).then(entity => {
            return entity[key] === null;
        });
    }

    /**
     * Clears an entry.
     * @param {string} id - ID of entry.
     * @returns {Bluebird<void>}
     */
    clear(id) {
        this.items.delete(id);
        return this.repository.delete(id);
    }
}

module.exports = { TypeORMProvider };
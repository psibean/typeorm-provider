# TypeORMProvider

I'm using TypeORM with [discord.js](https://github.com/discordjs/discord.js) and [discord-akairo](https://github.com/discord-akairo), since discord-akairo does not yet natively support a TypeORM provider, I made this one! Nothing special, all I did was copy the SequelizeProvider and update it to use a TypeORM Repository instead.

Feel free to use this and make changes, happy to accept pull requests if I've messed something up or overlooked / misunderstood something.

## Installation

```
npm install @psibean/typeorm-provider
```

## Usage

```
import { TypeORMProvider } from '@psibean/typeorm-provider';
```
```
const { TypeORMProvider } = require('@psibean/typeorm-provider')
```
```
provider = new 
            TypeORMProvider(
              connection.get(connectionName).getRepository(Entity), 
              { idColumn: "id", 
                dataColumn: "jsonColumnName" 
            });
```

One other difference between this provider and the other providers is set, which can take a defaultData value for when it has to create a new record:

```
provider.set(id, key, value, defaultData = { "one": true, "two": "someValue" });
```

If there is no record for the provided id, then a new record will be created that looks like:
```
{ "one": true, "two": "someValue", [key]: value } 
```

If the provided key matches one of the keys in the defaultData the passed value will overwrite the default.

It otherwise works the same as the other providers, the only difference is isntead of taking the actual model / entity, it takes the repository instead.
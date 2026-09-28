
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Courier
 * 
 */
export type Courier = $Result.DefaultSelection<Prisma.$CourierPayload>
/**
 * Model ShippingRate
 * 
 */
export type ShippingRate = $Result.DefaultSelection<Prisma.$ShippingRatePayload>
/**
 * Model ShippingOrder
 * 
 */
export type ShippingOrder = $Result.DefaultSelection<Prisma.$ShippingOrderPayload>
/**
 * Model ShippingStatusHistory
 * 
 */
export type ShippingStatusHistory = $Result.DefaultSelection<Prisma.$ShippingStatusHistoryPayload>
/**
 * Model OutboxEvent
 * 
 */
export type OutboxEvent = $Result.DefaultSelection<Prisma.$OutboxEventPayload>
/**
 * Model ShippingQuote
 * A server-issued shipping price that checkout can trust.
 * 
 * The browser never supplies a shipping cost. It asks for a quote, receives an
 * opaque id, and passes that id to checkout; the Order Service resolves the id
 * back to this row. The snapshot columns record exactly what the price was
 * computed from, so revalidation at checkout can detect a changed cart,
 * address, or rate table rather than silently honouring a stale price.
 */
export type ShippingQuote = $Result.DefaultSelection<Prisma.$ShippingQuotePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Couriers
 * const couriers = await prisma.courier.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Couriers
   * const couriers = await prisma.courier.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.courier`: Exposes CRUD operations for the **Courier** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Couriers
    * const couriers = await prisma.courier.findMany()
    * ```
    */
  get courier(): Prisma.CourierDelegate<ExtArgs>;

  /**
   * `prisma.shippingRate`: Exposes CRUD operations for the **ShippingRate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShippingRates
    * const shippingRates = await prisma.shippingRate.findMany()
    * ```
    */
  get shippingRate(): Prisma.ShippingRateDelegate<ExtArgs>;

  /**
   * `prisma.shippingOrder`: Exposes CRUD operations for the **ShippingOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShippingOrders
    * const shippingOrders = await prisma.shippingOrder.findMany()
    * ```
    */
  get shippingOrder(): Prisma.ShippingOrderDelegate<ExtArgs>;

  /**
   * `prisma.shippingStatusHistory`: Exposes CRUD operations for the **ShippingStatusHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShippingStatusHistories
    * const shippingStatusHistories = await prisma.shippingStatusHistory.findMany()
    * ```
    */
  get shippingStatusHistory(): Prisma.ShippingStatusHistoryDelegate<ExtArgs>;

  /**
   * `prisma.outboxEvent`: Exposes CRUD operations for the **OutboxEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutboxEvents
    * const outboxEvents = await prisma.outboxEvent.findMany()
    * ```
    */
  get outboxEvent(): Prisma.OutboxEventDelegate<ExtArgs>;

  /**
   * `prisma.shippingQuote`: Exposes CRUD operations for the **ShippingQuote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShippingQuotes
    * const shippingQuotes = await prisma.shippingQuote.findMany()
    * ```
    */
  get shippingQuote(): Prisma.ShippingQuoteDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Courier: 'Courier',
    ShippingRate: 'ShippingRate',
    ShippingOrder: 'ShippingOrder',
    ShippingStatusHistory: 'ShippingStatusHistory',
    OutboxEvent: 'OutboxEvent',
    ShippingQuote: 'ShippingQuote'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "courier" | "shippingRate" | "shippingOrder" | "shippingStatusHistory" | "outboxEvent" | "shippingQuote"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Courier: {
        payload: Prisma.$CourierPayload<ExtArgs>
        fields: Prisma.CourierFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourierFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourierFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>
          }
          findFirst: {
            args: Prisma.CourierFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourierFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>
          }
          findMany: {
            args: Prisma.CourierFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>[]
          }
          create: {
            args: Prisma.CourierCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>
          }
          createMany: {
            args: Prisma.CourierCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourierCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>[]
          }
          delete: {
            args: Prisma.CourierDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>
          }
          update: {
            args: Prisma.CourierUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>
          }
          deleteMany: {
            args: Prisma.CourierDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourierUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CourierUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourierPayload>
          }
          aggregate: {
            args: Prisma.CourierAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourier>
          }
          groupBy: {
            args: Prisma.CourierGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourierGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourierCountArgs<ExtArgs>
            result: $Utils.Optional<CourierCountAggregateOutputType> | number
          }
        }
      }
      ShippingRate: {
        payload: Prisma.$ShippingRatePayload<ExtArgs>
        fields: Prisma.ShippingRateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShippingRateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShippingRateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>
          }
          findFirst: {
            args: Prisma.ShippingRateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShippingRateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>
          }
          findMany: {
            args: Prisma.ShippingRateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>[]
          }
          create: {
            args: Prisma.ShippingRateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>
          }
          createMany: {
            args: Prisma.ShippingRateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShippingRateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>[]
          }
          delete: {
            args: Prisma.ShippingRateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>
          }
          update: {
            args: Prisma.ShippingRateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>
          }
          deleteMany: {
            args: Prisma.ShippingRateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShippingRateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ShippingRateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingRatePayload>
          }
          aggregate: {
            args: Prisma.ShippingRateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShippingRate>
          }
          groupBy: {
            args: Prisma.ShippingRateGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShippingRateGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShippingRateCountArgs<ExtArgs>
            result: $Utils.Optional<ShippingRateCountAggregateOutputType> | number
          }
        }
      }
      ShippingOrder: {
        payload: Prisma.$ShippingOrderPayload<ExtArgs>
        fields: Prisma.ShippingOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShippingOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShippingOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>
          }
          findFirst: {
            args: Prisma.ShippingOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShippingOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>
          }
          findMany: {
            args: Prisma.ShippingOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>[]
          }
          create: {
            args: Prisma.ShippingOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>
          }
          createMany: {
            args: Prisma.ShippingOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShippingOrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>[]
          }
          delete: {
            args: Prisma.ShippingOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>
          }
          update: {
            args: Prisma.ShippingOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>
          }
          deleteMany: {
            args: Prisma.ShippingOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShippingOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ShippingOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingOrderPayload>
          }
          aggregate: {
            args: Prisma.ShippingOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShippingOrder>
          }
          groupBy: {
            args: Prisma.ShippingOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShippingOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShippingOrderCountArgs<ExtArgs>
            result: $Utils.Optional<ShippingOrderCountAggregateOutputType> | number
          }
        }
      }
      ShippingStatusHistory: {
        payload: Prisma.$ShippingStatusHistoryPayload<ExtArgs>
        fields: Prisma.ShippingStatusHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShippingStatusHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShippingStatusHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>
          }
          findFirst: {
            args: Prisma.ShippingStatusHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShippingStatusHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>
          }
          findMany: {
            args: Prisma.ShippingStatusHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>[]
          }
          create: {
            args: Prisma.ShippingStatusHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>
          }
          createMany: {
            args: Prisma.ShippingStatusHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShippingStatusHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>[]
          }
          delete: {
            args: Prisma.ShippingStatusHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>
          }
          update: {
            args: Prisma.ShippingStatusHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>
          }
          deleteMany: {
            args: Prisma.ShippingStatusHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShippingStatusHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ShippingStatusHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingStatusHistoryPayload>
          }
          aggregate: {
            args: Prisma.ShippingStatusHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShippingStatusHistory>
          }
          groupBy: {
            args: Prisma.ShippingStatusHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShippingStatusHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShippingStatusHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<ShippingStatusHistoryCountAggregateOutputType> | number
          }
        }
      }
      OutboxEvent: {
        payload: Prisma.$OutboxEventPayload<ExtArgs>
        fields: Prisma.OutboxEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutboxEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutboxEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          findFirst: {
            args: Prisma.OutboxEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutboxEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          findMany: {
            args: Prisma.OutboxEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>[]
          }
          create: {
            args: Prisma.OutboxEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          createMany: {
            args: Prisma.OutboxEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutboxEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>[]
          }
          delete: {
            args: Prisma.OutboxEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          update: {
            args: Prisma.OutboxEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          deleteMany: {
            args: Prisma.OutboxEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutboxEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OutboxEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxEventPayload>
          }
          aggregate: {
            args: Prisma.OutboxEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutboxEvent>
          }
          groupBy: {
            args: Prisma.OutboxEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutboxEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutboxEventCountArgs<ExtArgs>
            result: $Utils.Optional<OutboxEventCountAggregateOutputType> | number
          }
        }
      }
      ShippingQuote: {
        payload: Prisma.$ShippingQuotePayload<ExtArgs>
        fields: Prisma.ShippingQuoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShippingQuoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShippingQuoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>
          }
          findFirst: {
            args: Prisma.ShippingQuoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShippingQuoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>
          }
          findMany: {
            args: Prisma.ShippingQuoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>[]
          }
          create: {
            args: Prisma.ShippingQuoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>
          }
          createMany: {
            args: Prisma.ShippingQuoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShippingQuoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>[]
          }
          delete: {
            args: Prisma.ShippingQuoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>
          }
          update: {
            args: Prisma.ShippingQuoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>
          }
          deleteMany: {
            args: Prisma.ShippingQuoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShippingQuoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ShippingQuoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShippingQuotePayload>
          }
          aggregate: {
            args: Prisma.ShippingQuoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShippingQuote>
          }
          groupBy: {
            args: Prisma.ShippingQuoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShippingQuoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShippingQuoteCountArgs<ExtArgs>
            result: $Utils.Optional<ShippingQuoteCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CourierCountOutputType
   */

  export type CourierCountOutputType = {
    rates: number
    orders: number
  }

  export type CourierCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rates?: boolean | CourierCountOutputTypeCountRatesArgs
    orders?: boolean | CourierCountOutputTypeCountOrdersArgs
  }

  // Custom InputTypes
  /**
   * CourierCountOutputType without action
   */
  export type CourierCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourierCountOutputType
     */
    select?: CourierCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CourierCountOutputType without action
   */
  export type CourierCountOutputTypeCountRatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingRateWhereInput
  }

  /**
   * CourierCountOutputType without action
   */
  export type CourierCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingOrderWhereInput
  }


  /**
   * Count Type ShippingOrderCountOutputType
   */

  export type ShippingOrderCountOutputType = {
    history: number
  }

  export type ShippingOrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    history?: boolean | ShippingOrderCountOutputTypeCountHistoryArgs
  }

  // Custom InputTypes
  /**
   * ShippingOrderCountOutputType without action
   */
  export type ShippingOrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrderCountOutputType
     */
    select?: ShippingOrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ShippingOrderCountOutputType without action
   */
  export type ShippingOrderCountOutputTypeCountHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingStatusHistoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Courier
   */

  export type AggregateCourier = {
    _count: CourierCountAggregateOutputType | null
    _min: CourierMinAggregateOutputType | null
    _max: CourierMaxAggregateOutputType | null
  }

  export type CourierMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    isActive: boolean | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CourierMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    isActive: boolean | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CourierCountAggregateOutputType = {
    id: number
    name: number
    code: number
    services: number
    isActive: number
    createdBy: number
    updatedBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CourierMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    isActive?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CourierMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    isActive?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CourierCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    services?: true
    isActive?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CourierAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Courier to aggregate.
     */
    where?: CourierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Couriers to fetch.
     */
    orderBy?: CourierOrderByWithRelationInput | CourierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Couriers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Couriers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Couriers
    **/
    _count?: true | CourierCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourierMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourierMaxAggregateInputType
  }

  export type GetCourierAggregateType<T extends CourierAggregateArgs> = {
        [P in keyof T & keyof AggregateCourier]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourier[P]>
      : GetScalarType<T[P], AggregateCourier[P]>
  }




  export type CourierGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourierWhereInput
    orderBy?: CourierOrderByWithAggregationInput | CourierOrderByWithAggregationInput[]
    by: CourierScalarFieldEnum[] | CourierScalarFieldEnum
    having?: CourierScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourierCountAggregateInputType | true
    _min?: CourierMinAggregateInputType
    _max?: CourierMaxAggregateInputType
  }

  export type CourierGroupByOutputType = {
    id: string
    name: string
    code: string
    services: JsonValue
    isActive: boolean
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: CourierCountAggregateOutputType | null
    _min: CourierMinAggregateOutputType | null
    _max: CourierMaxAggregateOutputType | null
  }

  type GetCourierGroupByPayload<T extends CourierGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourierGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourierGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourierGroupByOutputType[P]>
            : GetScalarType<T[P], CourierGroupByOutputType[P]>
        }
      >
    >


  export type CourierSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    services?: boolean
    isActive?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rates?: boolean | Courier$ratesArgs<ExtArgs>
    orders?: boolean | Courier$ordersArgs<ExtArgs>
    _count?: boolean | CourierCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courier"]>

  export type CourierSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    services?: boolean
    isActive?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["courier"]>

  export type CourierSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    services?: boolean
    isActive?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CourierInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rates?: boolean | Courier$ratesArgs<ExtArgs>
    orders?: boolean | Courier$ordersArgs<ExtArgs>
    _count?: boolean | CourierCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CourierIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CourierPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Courier"
    objects: {
      rates: Prisma.$ShippingRatePayload<ExtArgs>[]
      orders: Prisma.$ShippingOrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      services: Prisma.JsonValue
      isActive: boolean
      createdBy: string | null
      updatedBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["courier"]>
    composites: {}
  }

  type CourierGetPayload<S extends boolean | null | undefined | CourierDefaultArgs> = $Result.GetResult<Prisma.$CourierPayload, S>

  type CourierCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CourierFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CourierCountAggregateInputType | true
    }

  export interface CourierDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Courier'], meta: { name: 'Courier' } }
    /**
     * Find zero or one Courier that matches the filter.
     * @param {CourierFindUniqueArgs} args - Arguments to find a Courier
     * @example
     * // Get one Courier
     * const courier = await prisma.courier.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourierFindUniqueArgs>(args: SelectSubset<T, CourierFindUniqueArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Courier that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CourierFindUniqueOrThrowArgs} args - Arguments to find a Courier
     * @example
     * // Get one Courier
     * const courier = await prisma.courier.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourierFindUniqueOrThrowArgs>(args: SelectSubset<T, CourierFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Courier that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierFindFirstArgs} args - Arguments to find a Courier
     * @example
     * // Get one Courier
     * const courier = await prisma.courier.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourierFindFirstArgs>(args?: SelectSubset<T, CourierFindFirstArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Courier that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierFindFirstOrThrowArgs} args - Arguments to find a Courier
     * @example
     * // Get one Courier
     * const courier = await prisma.courier.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourierFindFirstOrThrowArgs>(args?: SelectSubset<T, CourierFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Couriers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Couriers
     * const couriers = await prisma.courier.findMany()
     * 
     * // Get first 10 Couriers
     * const couriers = await prisma.courier.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courierWithIdOnly = await prisma.courier.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourierFindManyArgs>(args?: SelectSubset<T, CourierFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Courier.
     * @param {CourierCreateArgs} args - Arguments to create a Courier.
     * @example
     * // Create one Courier
     * const Courier = await prisma.courier.create({
     *   data: {
     *     // ... data to create a Courier
     *   }
     * })
     * 
     */
    create<T extends CourierCreateArgs>(args: SelectSubset<T, CourierCreateArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Couriers.
     * @param {CourierCreateManyArgs} args - Arguments to create many Couriers.
     * @example
     * // Create many Couriers
     * const courier = await prisma.courier.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourierCreateManyArgs>(args?: SelectSubset<T, CourierCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Couriers and returns the data saved in the database.
     * @param {CourierCreateManyAndReturnArgs} args - Arguments to create many Couriers.
     * @example
     * // Create many Couriers
     * const courier = await prisma.courier.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Couriers and only return the `id`
     * const courierWithIdOnly = await prisma.courier.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourierCreateManyAndReturnArgs>(args?: SelectSubset<T, CourierCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Courier.
     * @param {CourierDeleteArgs} args - Arguments to delete one Courier.
     * @example
     * // Delete one Courier
     * const Courier = await prisma.courier.delete({
     *   where: {
     *     // ... filter to delete one Courier
     *   }
     * })
     * 
     */
    delete<T extends CourierDeleteArgs>(args: SelectSubset<T, CourierDeleteArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Courier.
     * @param {CourierUpdateArgs} args - Arguments to update one Courier.
     * @example
     * // Update one Courier
     * const courier = await prisma.courier.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourierUpdateArgs>(args: SelectSubset<T, CourierUpdateArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Couriers.
     * @param {CourierDeleteManyArgs} args - Arguments to filter Couriers to delete.
     * @example
     * // Delete a few Couriers
     * const { count } = await prisma.courier.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourierDeleteManyArgs>(args?: SelectSubset<T, CourierDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Couriers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Couriers
     * const courier = await prisma.courier.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourierUpdateManyArgs>(args: SelectSubset<T, CourierUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Courier.
     * @param {CourierUpsertArgs} args - Arguments to update or create a Courier.
     * @example
     * // Update or create a Courier
     * const courier = await prisma.courier.upsert({
     *   create: {
     *     // ... data to create a Courier
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Courier we want to update
     *   }
     * })
     */
    upsert<T extends CourierUpsertArgs>(args: SelectSubset<T, CourierUpsertArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Couriers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierCountArgs} args - Arguments to filter Couriers to count.
     * @example
     * // Count the number of Couriers
     * const count = await prisma.courier.count({
     *   where: {
     *     // ... the filter for the Couriers we want to count
     *   }
     * })
    **/
    count<T extends CourierCountArgs>(
      args?: Subset<T, CourierCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourierCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Courier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourierAggregateArgs>(args: Subset<T, CourierAggregateArgs>): Prisma.PrismaPromise<GetCourierAggregateType<T>>

    /**
     * Group by Courier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourierGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourierGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourierGroupByArgs['orderBy'] }
        : { orderBy?: CourierGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourierGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourierGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Courier model
   */
  readonly fields: CourierFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Courier.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourierClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    rates<T extends Courier$ratesArgs<ExtArgs> = {}>(args?: Subset<T, Courier$ratesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "findMany"> | Null>
    orders<T extends Courier$ordersArgs<ExtArgs> = {}>(args?: Subset<T, Courier$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Courier model
   */ 
  interface CourierFieldRefs {
    readonly id: FieldRef<"Courier", 'String'>
    readonly name: FieldRef<"Courier", 'String'>
    readonly code: FieldRef<"Courier", 'String'>
    readonly services: FieldRef<"Courier", 'Json'>
    readonly isActive: FieldRef<"Courier", 'Boolean'>
    readonly createdBy: FieldRef<"Courier", 'String'>
    readonly updatedBy: FieldRef<"Courier", 'String'>
    readonly createdAt: FieldRef<"Courier", 'DateTime'>
    readonly updatedAt: FieldRef<"Courier", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Courier findUnique
   */
  export type CourierFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * Filter, which Courier to fetch.
     */
    where: CourierWhereUniqueInput
  }

  /**
   * Courier findUniqueOrThrow
   */
  export type CourierFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * Filter, which Courier to fetch.
     */
    where: CourierWhereUniqueInput
  }

  /**
   * Courier findFirst
   */
  export type CourierFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * Filter, which Courier to fetch.
     */
    where?: CourierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Couriers to fetch.
     */
    orderBy?: CourierOrderByWithRelationInput | CourierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Couriers.
     */
    cursor?: CourierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Couriers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Couriers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Couriers.
     */
    distinct?: CourierScalarFieldEnum | CourierScalarFieldEnum[]
  }

  /**
   * Courier findFirstOrThrow
   */
  export type CourierFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * Filter, which Courier to fetch.
     */
    where?: CourierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Couriers to fetch.
     */
    orderBy?: CourierOrderByWithRelationInput | CourierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Couriers.
     */
    cursor?: CourierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Couriers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Couriers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Couriers.
     */
    distinct?: CourierScalarFieldEnum | CourierScalarFieldEnum[]
  }

  /**
   * Courier findMany
   */
  export type CourierFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * Filter, which Couriers to fetch.
     */
    where?: CourierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Couriers to fetch.
     */
    orderBy?: CourierOrderByWithRelationInput | CourierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Couriers.
     */
    cursor?: CourierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Couriers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Couriers.
     */
    skip?: number
    distinct?: CourierScalarFieldEnum | CourierScalarFieldEnum[]
  }

  /**
   * Courier create
   */
  export type CourierCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * The data needed to create a Courier.
     */
    data: XOR<CourierCreateInput, CourierUncheckedCreateInput>
  }

  /**
   * Courier createMany
   */
  export type CourierCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Couriers.
     */
    data: CourierCreateManyInput | CourierCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Courier createManyAndReturn
   */
  export type CourierCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Couriers.
     */
    data: CourierCreateManyInput | CourierCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Courier update
   */
  export type CourierUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * The data needed to update a Courier.
     */
    data: XOR<CourierUpdateInput, CourierUncheckedUpdateInput>
    /**
     * Choose, which Courier to update.
     */
    where: CourierWhereUniqueInput
  }

  /**
   * Courier updateMany
   */
  export type CourierUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Couriers.
     */
    data: XOR<CourierUpdateManyMutationInput, CourierUncheckedUpdateManyInput>
    /**
     * Filter which Couriers to update
     */
    where?: CourierWhereInput
  }

  /**
   * Courier upsert
   */
  export type CourierUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * The filter to search for the Courier to update in case it exists.
     */
    where: CourierWhereUniqueInput
    /**
     * In case the Courier found by the `where` argument doesn't exist, create a new Courier with this data.
     */
    create: XOR<CourierCreateInput, CourierUncheckedCreateInput>
    /**
     * In case the Courier was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourierUpdateInput, CourierUncheckedUpdateInput>
  }

  /**
   * Courier delete
   */
  export type CourierDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
    /**
     * Filter which Courier to delete.
     */
    where: CourierWhereUniqueInput
  }

  /**
   * Courier deleteMany
   */
  export type CourierDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Couriers to delete
     */
    where?: CourierWhereInput
  }

  /**
   * Courier.rates
   */
  export type Courier$ratesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    where?: ShippingRateWhereInput
    orderBy?: ShippingRateOrderByWithRelationInput | ShippingRateOrderByWithRelationInput[]
    cursor?: ShippingRateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShippingRateScalarFieldEnum | ShippingRateScalarFieldEnum[]
  }

  /**
   * Courier.orders
   */
  export type Courier$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    where?: ShippingOrderWhereInput
    orderBy?: ShippingOrderOrderByWithRelationInput | ShippingOrderOrderByWithRelationInput[]
    cursor?: ShippingOrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShippingOrderScalarFieldEnum | ShippingOrderScalarFieldEnum[]
  }

  /**
   * Courier without action
   */
  export type CourierDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Courier
     */
    select?: CourierSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourierInclude<ExtArgs> | null
  }


  /**
   * Model ShippingRate
   */

  export type AggregateShippingRate = {
    _count: ShippingRateCountAggregateOutputType | null
    _avg: ShippingRateAvgAggregateOutputType | null
    _sum: ShippingRateSumAggregateOutputType | null
    _min: ShippingRateMinAggregateOutputType | null
    _max: ShippingRateMaxAggregateOutputType | null
  }

  export type ShippingRateAvgAggregateOutputType = {
    weight: number | null
    cost: Decimal | null
  }

  export type ShippingRateSumAggregateOutputType = {
    weight: number | null
    cost: Decimal | null
  }

  export type ShippingRateMinAggregateOutputType = {
    id: string | null
    courierId: string | null
    originCity: string | null
    destinationCity: string | null
    serviceCode: string | null
    weight: number | null
    cost: Decimal | null
    estimatedDays: string | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShippingRateMaxAggregateOutputType = {
    id: string | null
    courierId: string | null
    originCity: string | null
    destinationCity: string | null
    serviceCode: string | null
    weight: number | null
    cost: Decimal | null
    estimatedDays: string | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShippingRateCountAggregateOutputType = {
    id: number
    courierId: number
    originCity: number
    destinationCity: number
    serviceCode: number
    weight: number
    cost: number
    estimatedDays: number
    createdBy: number
    updatedBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ShippingRateAvgAggregateInputType = {
    weight?: true
    cost?: true
  }

  export type ShippingRateSumAggregateInputType = {
    weight?: true
    cost?: true
  }

  export type ShippingRateMinAggregateInputType = {
    id?: true
    courierId?: true
    originCity?: true
    destinationCity?: true
    serviceCode?: true
    weight?: true
    cost?: true
    estimatedDays?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShippingRateMaxAggregateInputType = {
    id?: true
    courierId?: true
    originCity?: true
    destinationCity?: true
    serviceCode?: true
    weight?: true
    cost?: true
    estimatedDays?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShippingRateCountAggregateInputType = {
    id?: true
    courierId?: true
    originCity?: true
    destinationCity?: true
    serviceCode?: true
    weight?: true
    cost?: true
    estimatedDays?: true
    createdBy?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ShippingRateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingRate to aggregate.
     */
    where?: ShippingRateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingRates to fetch.
     */
    orderBy?: ShippingRateOrderByWithRelationInput | ShippingRateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShippingRateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingRates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingRates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShippingRates
    **/
    _count?: true | ShippingRateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShippingRateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShippingRateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShippingRateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShippingRateMaxAggregateInputType
  }

  export type GetShippingRateAggregateType<T extends ShippingRateAggregateArgs> = {
        [P in keyof T & keyof AggregateShippingRate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShippingRate[P]>
      : GetScalarType<T[P], AggregateShippingRate[P]>
  }




  export type ShippingRateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingRateWhereInput
    orderBy?: ShippingRateOrderByWithAggregationInput | ShippingRateOrderByWithAggregationInput[]
    by: ShippingRateScalarFieldEnum[] | ShippingRateScalarFieldEnum
    having?: ShippingRateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShippingRateCountAggregateInputType | true
    _avg?: ShippingRateAvgAggregateInputType
    _sum?: ShippingRateSumAggregateInputType
    _min?: ShippingRateMinAggregateInputType
    _max?: ShippingRateMaxAggregateInputType
  }

  export type ShippingRateGroupByOutputType = {
    id: string
    courierId: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal
    estimatedDays: string
    createdBy: string | null
    updatedBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: ShippingRateCountAggregateOutputType | null
    _avg: ShippingRateAvgAggregateOutputType | null
    _sum: ShippingRateSumAggregateOutputType | null
    _min: ShippingRateMinAggregateOutputType | null
    _max: ShippingRateMaxAggregateOutputType | null
  }

  type GetShippingRateGroupByPayload<T extends ShippingRateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShippingRateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShippingRateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShippingRateGroupByOutputType[P]>
            : GetScalarType<T[P], ShippingRateGroupByOutputType[P]>
        }
      >
    >


  export type ShippingRateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    courierId?: boolean
    originCity?: boolean
    destinationCity?: boolean
    serviceCode?: boolean
    weight?: boolean
    cost?: boolean
    estimatedDays?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    courier?: boolean | CourierDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shippingRate"]>

  export type ShippingRateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    courierId?: boolean
    originCity?: boolean
    destinationCity?: boolean
    serviceCode?: boolean
    weight?: boolean
    cost?: boolean
    estimatedDays?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    courier?: boolean | CourierDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shippingRate"]>

  export type ShippingRateSelectScalar = {
    id?: boolean
    courierId?: boolean
    originCity?: boolean
    destinationCity?: boolean
    serviceCode?: boolean
    weight?: boolean
    cost?: boolean
    estimatedDays?: boolean
    createdBy?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ShippingRateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courier?: boolean | CourierDefaultArgs<ExtArgs>
  }
  export type ShippingRateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courier?: boolean | CourierDefaultArgs<ExtArgs>
  }

  export type $ShippingRatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShippingRate"
    objects: {
      courier: Prisma.$CourierPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      courierId: string
      originCity: string
      destinationCity: string
      serviceCode: string
      weight: number
      cost: Prisma.Decimal
      estimatedDays: string
      createdBy: string | null
      updatedBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["shippingRate"]>
    composites: {}
  }

  type ShippingRateGetPayload<S extends boolean | null | undefined | ShippingRateDefaultArgs> = $Result.GetResult<Prisma.$ShippingRatePayload, S>

  type ShippingRateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShippingRateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShippingRateCountAggregateInputType | true
    }

  export interface ShippingRateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShippingRate'], meta: { name: 'ShippingRate' } }
    /**
     * Find zero or one ShippingRate that matches the filter.
     * @param {ShippingRateFindUniqueArgs} args - Arguments to find a ShippingRate
     * @example
     * // Get one ShippingRate
     * const shippingRate = await prisma.shippingRate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShippingRateFindUniqueArgs>(args: SelectSubset<T, ShippingRateFindUniqueArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ShippingRate that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ShippingRateFindUniqueOrThrowArgs} args - Arguments to find a ShippingRate
     * @example
     * // Get one ShippingRate
     * const shippingRate = await prisma.shippingRate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShippingRateFindUniqueOrThrowArgs>(args: SelectSubset<T, ShippingRateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ShippingRate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateFindFirstArgs} args - Arguments to find a ShippingRate
     * @example
     * // Get one ShippingRate
     * const shippingRate = await prisma.shippingRate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShippingRateFindFirstArgs>(args?: SelectSubset<T, ShippingRateFindFirstArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ShippingRate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateFindFirstOrThrowArgs} args - Arguments to find a ShippingRate
     * @example
     * // Get one ShippingRate
     * const shippingRate = await prisma.shippingRate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShippingRateFindFirstOrThrowArgs>(args?: SelectSubset<T, ShippingRateFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ShippingRates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShippingRates
     * const shippingRates = await prisma.shippingRate.findMany()
     * 
     * // Get first 10 ShippingRates
     * const shippingRates = await prisma.shippingRate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shippingRateWithIdOnly = await prisma.shippingRate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShippingRateFindManyArgs>(args?: SelectSubset<T, ShippingRateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ShippingRate.
     * @param {ShippingRateCreateArgs} args - Arguments to create a ShippingRate.
     * @example
     * // Create one ShippingRate
     * const ShippingRate = await prisma.shippingRate.create({
     *   data: {
     *     // ... data to create a ShippingRate
     *   }
     * })
     * 
     */
    create<T extends ShippingRateCreateArgs>(args: SelectSubset<T, ShippingRateCreateArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ShippingRates.
     * @param {ShippingRateCreateManyArgs} args - Arguments to create many ShippingRates.
     * @example
     * // Create many ShippingRates
     * const shippingRate = await prisma.shippingRate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShippingRateCreateManyArgs>(args?: SelectSubset<T, ShippingRateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShippingRates and returns the data saved in the database.
     * @param {ShippingRateCreateManyAndReturnArgs} args - Arguments to create many ShippingRates.
     * @example
     * // Create many ShippingRates
     * const shippingRate = await prisma.shippingRate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShippingRates and only return the `id`
     * const shippingRateWithIdOnly = await prisma.shippingRate.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShippingRateCreateManyAndReturnArgs>(args?: SelectSubset<T, ShippingRateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ShippingRate.
     * @param {ShippingRateDeleteArgs} args - Arguments to delete one ShippingRate.
     * @example
     * // Delete one ShippingRate
     * const ShippingRate = await prisma.shippingRate.delete({
     *   where: {
     *     // ... filter to delete one ShippingRate
     *   }
     * })
     * 
     */
    delete<T extends ShippingRateDeleteArgs>(args: SelectSubset<T, ShippingRateDeleteArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ShippingRate.
     * @param {ShippingRateUpdateArgs} args - Arguments to update one ShippingRate.
     * @example
     * // Update one ShippingRate
     * const shippingRate = await prisma.shippingRate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShippingRateUpdateArgs>(args: SelectSubset<T, ShippingRateUpdateArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ShippingRates.
     * @param {ShippingRateDeleteManyArgs} args - Arguments to filter ShippingRates to delete.
     * @example
     * // Delete a few ShippingRates
     * const { count } = await prisma.shippingRate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShippingRateDeleteManyArgs>(args?: SelectSubset<T, ShippingRateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShippingRates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShippingRates
     * const shippingRate = await prisma.shippingRate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShippingRateUpdateManyArgs>(args: SelectSubset<T, ShippingRateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ShippingRate.
     * @param {ShippingRateUpsertArgs} args - Arguments to update or create a ShippingRate.
     * @example
     * // Update or create a ShippingRate
     * const shippingRate = await prisma.shippingRate.upsert({
     *   create: {
     *     // ... data to create a ShippingRate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShippingRate we want to update
     *   }
     * })
     */
    upsert<T extends ShippingRateUpsertArgs>(args: SelectSubset<T, ShippingRateUpsertArgs<ExtArgs>>): Prisma__ShippingRateClient<$Result.GetResult<Prisma.$ShippingRatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ShippingRates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateCountArgs} args - Arguments to filter ShippingRates to count.
     * @example
     * // Count the number of ShippingRates
     * const count = await prisma.shippingRate.count({
     *   where: {
     *     // ... the filter for the ShippingRates we want to count
     *   }
     * })
    **/
    count<T extends ShippingRateCountArgs>(
      args?: Subset<T, ShippingRateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShippingRateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShippingRate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShippingRateAggregateArgs>(args: Subset<T, ShippingRateAggregateArgs>): Prisma.PrismaPromise<GetShippingRateAggregateType<T>>

    /**
     * Group by ShippingRate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingRateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShippingRateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShippingRateGroupByArgs['orderBy'] }
        : { orderBy?: ShippingRateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShippingRateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShippingRateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShippingRate model
   */
  readonly fields: ShippingRateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShippingRate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShippingRateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    courier<T extends CourierDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CourierDefaultArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShippingRate model
   */ 
  interface ShippingRateFieldRefs {
    readonly id: FieldRef<"ShippingRate", 'String'>
    readonly courierId: FieldRef<"ShippingRate", 'String'>
    readonly originCity: FieldRef<"ShippingRate", 'String'>
    readonly destinationCity: FieldRef<"ShippingRate", 'String'>
    readonly serviceCode: FieldRef<"ShippingRate", 'String'>
    readonly weight: FieldRef<"ShippingRate", 'Int'>
    readonly cost: FieldRef<"ShippingRate", 'Decimal'>
    readonly estimatedDays: FieldRef<"ShippingRate", 'String'>
    readonly createdBy: FieldRef<"ShippingRate", 'String'>
    readonly updatedBy: FieldRef<"ShippingRate", 'String'>
    readonly createdAt: FieldRef<"ShippingRate", 'DateTime'>
    readonly updatedAt: FieldRef<"ShippingRate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShippingRate findUnique
   */
  export type ShippingRateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * Filter, which ShippingRate to fetch.
     */
    where: ShippingRateWhereUniqueInput
  }

  /**
   * ShippingRate findUniqueOrThrow
   */
  export type ShippingRateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * Filter, which ShippingRate to fetch.
     */
    where: ShippingRateWhereUniqueInput
  }

  /**
   * ShippingRate findFirst
   */
  export type ShippingRateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * Filter, which ShippingRate to fetch.
     */
    where?: ShippingRateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingRates to fetch.
     */
    orderBy?: ShippingRateOrderByWithRelationInput | ShippingRateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingRates.
     */
    cursor?: ShippingRateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingRates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingRates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingRates.
     */
    distinct?: ShippingRateScalarFieldEnum | ShippingRateScalarFieldEnum[]
  }

  /**
   * ShippingRate findFirstOrThrow
   */
  export type ShippingRateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * Filter, which ShippingRate to fetch.
     */
    where?: ShippingRateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingRates to fetch.
     */
    orderBy?: ShippingRateOrderByWithRelationInput | ShippingRateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingRates.
     */
    cursor?: ShippingRateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingRates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingRates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingRates.
     */
    distinct?: ShippingRateScalarFieldEnum | ShippingRateScalarFieldEnum[]
  }

  /**
   * ShippingRate findMany
   */
  export type ShippingRateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * Filter, which ShippingRates to fetch.
     */
    where?: ShippingRateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingRates to fetch.
     */
    orderBy?: ShippingRateOrderByWithRelationInput | ShippingRateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShippingRates.
     */
    cursor?: ShippingRateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingRates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingRates.
     */
    skip?: number
    distinct?: ShippingRateScalarFieldEnum | ShippingRateScalarFieldEnum[]
  }

  /**
   * ShippingRate create
   */
  export type ShippingRateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * The data needed to create a ShippingRate.
     */
    data: XOR<ShippingRateCreateInput, ShippingRateUncheckedCreateInput>
  }

  /**
   * ShippingRate createMany
   */
  export type ShippingRateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShippingRates.
     */
    data: ShippingRateCreateManyInput | ShippingRateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShippingRate createManyAndReturn
   */
  export type ShippingRateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ShippingRates.
     */
    data: ShippingRateCreateManyInput | ShippingRateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShippingRate update
   */
  export type ShippingRateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * The data needed to update a ShippingRate.
     */
    data: XOR<ShippingRateUpdateInput, ShippingRateUncheckedUpdateInput>
    /**
     * Choose, which ShippingRate to update.
     */
    where: ShippingRateWhereUniqueInput
  }

  /**
   * ShippingRate updateMany
   */
  export type ShippingRateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShippingRates.
     */
    data: XOR<ShippingRateUpdateManyMutationInput, ShippingRateUncheckedUpdateManyInput>
    /**
     * Filter which ShippingRates to update
     */
    where?: ShippingRateWhereInput
  }

  /**
   * ShippingRate upsert
   */
  export type ShippingRateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * The filter to search for the ShippingRate to update in case it exists.
     */
    where: ShippingRateWhereUniqueInput
    /**
     * In case the ShippingRate found by the `where` argument doesn't exist, create a new ShippingRate with this data.
     */
    create: XOR<ShippingRateCreateInput, ShippingRateUncheckedCreateInput>
    /**
     * In case the ShippingRate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShippingRateUpdateInput, ShippingRateUncheckedUpdateInput>
  }

  /**
   * ShippingRate delete
   */
  export type ShippingRateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
    /**
     * Filter which ShippingRate to delete.
     */
    where: ShippingRateWhereUniqueInput
  }

  /**
   * ShippingRate deleteMany
   */
  export type ShippingRateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingRates to delete
     */
    where?: ShippingRateWhereInput
  }

  /**
   * ShippingRate without action
   */
  export type ShippingRateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingRate
     */
    select?: ShippingRateSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingRateInclude<ExtArgs> | null
  }


  /**
   * Model ShippingOrder
   */

  export type AggregateShippingOrder = {
    _count: ShippingOrderCountAggregateOutputType | null
    _avg: ShippingOrderAvgAggregateOutputType | null
    _sum: ShippingOrderSumAggregateOutputType | null
    _min: ShippingOrderMinAggregateOutputType | null
    _max: ShippingOrderMaxAggregateOutputType | null
  }

  export type ShippingOrderAvgAggregateOutputType = {
    weight: number | null
    cost: Decimal | null
  }

  export type ShippingOrderSumAggregateOutputType = {
    weight: number | null
    cost: Decimal | null
  }

  export type ShippingOrderMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    sellerId: string | null
    courierId: string | null
    courierName: string | null
    serviceCode: string | null
    serviceName: string | null
    trackingNumber: string | null
    weight: number | null
    cost: Decimal | null
    status: string | null
    estimatedDelivery: string | null
    notes: string | null
    shippedAt: Date | null
    deliveredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShippingOrderMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    sellerId: string | null
    courierId: string | null
    courierName: string | null
    serviceCode: string | null
    serviceName: string | null
    trackingNumber: string | null
    weight: number | null
    cost: Decimal | null
    status: string | null
    estimatedDelivery: string | null
    notes: string | null
    shippedAt: Date | null
    deliveredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShippingOrderCountAggregateOutputType = {
    id: number
    orderId: number
    sellerId: number
    courierId: number
    courierName: number
    serviceCode: number
    serviceName: number
    trackingNumber: number
    originAddress: number
    destinationAddress: number
    weight: number
    cost: number
    status: number
    estimatedDelivery: number
    notes: number
    shippedAt: number
    deliveredAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ShippingOrderAvgAggregateInputType = {
    weight?: true
    cost?: true
  }

  export type ShippingOrderSumAggregateInputType = {
    weight?: true
    cost?: true
  }

  export type ShippingOrderMinAggregateInputType = {
    id?: true
    orderId?: true
    sellerId?: true
    courierId?: true
    courierName?: true
    serviceCode?: true
    serviceName?: true
    trackingNumber?: true
    weight?: true
    cost?: true
    status?: true
    estimatedDelivery?: true
    notes?: true
    shippedAt?: true
    deliveredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShippingOrderMaxAggregateInputType = {
    id?: true
    orderId?: true
    sellerId?: true
    courierId?: true
    courierName?: true
    serviceCode?: true
    serviceName?: true
    trackingNumber?: true
    weight?: true
    cost?: true
    status?: true
    estimatedDelivery?: true
    notes?: true
    shippedAt?: true
    deliveredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShippingOrderCountAggregateInputType = {
    id?: true
    orderId?: true
    sellerId?: true
    courierId?: true
    courierName?: true
    serviceCode?: true
    serviceName?: true
    trackingNumber?: true
    originAddress?: true
    destinationAddress?: true
    weight?: true
    cost?: true
    status?: true
    estimatedDelivery?: true
    notes?: true
    shippedAt?: true
    deliveredAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ShippingOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingOrder to aggregate.
     */
    where?: ShippingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingOrders to fetch.
     */
    orderBy?: ShippingOrderOrderByWithRelationInput | ShippingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShippingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShippingOrders
    **/
    _count?: true | ShippingOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShippingOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShippingOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShippingOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShippingOrderMaxAggregateInputType
  }

  export type GetShippingOrderAggregateType<T extends ShippingOrderAggregateArgs> = {
        [P in keyof T & keyof AggregateShippingOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShippingOrder[P]>
      : GetScalarType<T[P], AggregateShippingOrder[P]>
  }




  export type ShippingOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingOrderWhereInput
    orderBy?: ShippingOrderOrderByWithAggregationInput | ShippingOrderOrderByWithAggregationInput[]
    by: ShippingOrderScalarFieldEnum[] | ShippingOrderScalarFieldEnum
    having?: ShippingOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShippingOrderCountAggregateInputType | true
    _avg?: ShippingOrderAvgAggregateInputType
    _sum?: ShippingOrderSumAggregateInputType
    _min?: ShippingOrderMinAggregateInputType
    _max?: ShippingOrderMaxAggregateInputType
  }

  export type ShippingOrderGroupByOutputType = {
    id: string
    orderId: string
    sellerId: string | null
    courierId: string
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber: string | null
    originAddress: JsonValue
    destinationAddress: JsonValue
    weight: number
    cost: Decimal
    status: string
    estimatedDelivery: string | null
    notes: string | null
    shippedAt: Date | null
    deliveredAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ShippingOrderCountAggregateOutputType | null
    _avg: ShippingOrderAvgAggregateOutputType | null
    _sum: ShippingOrderSumAggregateOutputType | null
    _min: ShippingOrderMinAggregateOutputType | null
    _max: ShippingOrderMaxAggregateOutputType | null
  }

  type GetShippingOrderGroupByPayload<T extends ShippingOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShippingOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShippingOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShippingOrderGroupByOutputType[P]>
            : GetScalarType<T[P], ShippingOrderGroupByOutputType[P]>
        }
      >
    >


  export type ShippingOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    sellerId?: boolean
    courierId?: boolean
    courierName?: boolean
    serviceCode?: boolean
    serviceName?: boolean
    trackingNumber?: boolean
    originAddress?: boolean
    destinationAddress?: boolean
    weight?: boolean
    cost?: boolean
    status?: boolean
    estimatedDelivery?: boolean
    notes?: boolean
    shippedAt?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    courier?: boolean | CourierDefaultArgs<ExtArgs>
    history?: boolean | ShippingOrder$historyArgs<ExtArgs>
    _count?: boolean | ShippingOrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shippingOrder"]>

  export type ShippingOrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    sellerId?: boolean
    courierId?: boolean
    courierName?: boolean
    serviceCode?: boolean
    serviceName?: boolean
    trackingNumber?: boolean
    originAddress?: boolean
    destinationAddress?: boolean
    weight?: boolean
    cost?: boolean
    status?: boolean
    estimatedDelivery?: boolean
    notes?: boolean
    shippedAt?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    courier?: boolean | CourierDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shippingOrder"]>

  export type ShippingOrderSelectScalar = {
    id?: boolean
    orderId?: boolean
    sellerId?: boolean
    courierId?: boolean
    courierName?: boolean
    serviceCode?: boolean
    serviceName?: boolean
    trackingNumber?: boolean
    originAddress?: boolean
    destinationAddress?: boolean
    weight?: boolean
    cost?: boolean
    status?: boolean
    estimatedDelivery?: boolean
    notes?: boolean
    shippedAt?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ShippingOrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courier?: boolean | CourierDefaultArgs<ExtArgs>
    history?: boolean | ShippingOrder$historyArgs<ExtArgs>
    _count?: boolean | ShippingOrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ShippingOrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    courier?: boolean | CourierDefaultArgs<ExtArgs>
  }

  export type $ShippingOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShippingOrder"
    objects: {
      courier: Prisma.$CourierPayload<ExtArgs>
      history: Prisma.$ShippingStatusHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      /**
       * Seller whose parcel this row represents. Nullable only for rows created
       * before split-shipment support; all new writes require it.
       */
      sellerId: string | null
      courierId: string
      courierName: string
      serviceCode: string
      serviceName: string
      trackingNumber: string | null
      originAddress: Prisma.JsonValue
      destinationAddress: Prisma.JsonValue
      weight: number
      cost: Prisma.Decimal
      status: string
      estimatedDelivery: string | null
      notes: string | null
      shippedAt: Date | null
      deliveredAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["shippingOrder"]>
    composites: {}
  }

  type ShippingOrderGetPayload<S extends boolean | null | undefined | ShippingOrderDefaultArgs> = $Result.GetResult<Prisma.$ShippingOrderPayload, S>

  type ShippingOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShippingOrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShippingOrderCountAggregateInputType | true
    }

  export interface ShippingOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShippingOrder'], meta: { name: 'ShippingOrder' } }
    /**
     * Find zero or one ShippingOrder that matches the filter.
     * @param {ShippingOrderFindUniqueArgs} args - Arguments to find a ShippingOrder
     * @example
     * // Get one ShippingOrder
     * const shippingOrder = await prisma.shippingOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShippingOrderFindUniqueArgs>(args: SelectSubset<T, ShippingOrderFindUniqueArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ShippingOrder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ShippingOrderFindUniqueOrThrowArgs} args - Arguments to find a ShippingOrder
     * @example
     * // Get one ShippingOrder
     * const shippingOrder = await prisma.shippingOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShippingOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, ShippingOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ShippingOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderFindFirstArgs} args - Arguments to find a ShippingOrder
     * @example
     * // Get one ShippingOrder
     * const shippingOrder = await prisma.shippingOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShippingOrderFindFirstArgs>(args?: SelectSubset<T, ShippingOrderFindFirstArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ShippingOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderFindFirstOrThrowArgs} args - Arguments to find a ShippingOrder
     * @example
     * // Get one ShippingOrder
     * const shippingOrder = await prisma.shippingOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShippingOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, ShippingOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ShippingOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShippingOrders
     * const shippingOrders = await prisma.shippingOrder.findMany()
     * 
     * // Get first 10 ShippingOrders
     * const shippingOrders = await prisma.shippingOrder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shippingOrderWithIdOnly = await prisma.shippingOrder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShippingOrderFindManyArgs>(args?: SelectSubset<T, ShippingOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ShippingOrder.
     * @param {ShippingOrderCreateArgs} args - Arguments to create a ShippingOrder.
     * @example
     * // Create one ShippingOrder
     * const ShippingOrder = await prisma.shippingOrder.create({
     *   data: {
     *     // ... data to create a ShippingOrder
     *   }
     * })
     * 
     */
    create<T extends ShippingOrderCreateArgs>(args: SelectSubset<T, ShippingOrderCreateArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ShippingOrders.
     * @param {ShippingOrderCreateManyArgs} args - Arguments to create many ShippingOrders.
     * @example
     * // Create many ShippingOrders
     * const shippingOrder = await prisma.shippingOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShippingOrderCreateManyArgs>(args?: SelectSubset<T, ShippingOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShippingOrders and returns the data saved in the database.
     * @param {ShippingOrderCreateManyAndReturnArgs} args - Arguments to create many ShippingOrders.
     * @example
     * // Create many ShippingOrders
     * const shippingOrder = await prisma.shippingOrder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShippingOrders and only return the `id`
     * const shippingOrderWithIdOnly = await prisma.shippingOrder.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShippingOrderCreateManyAndReturnArgs>(args?: SelectSubset<T, ShippingOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ShippingOrder.
     * @param {ShippingOrderDeleteArgs} args - Arguments to delete one ShippingOrder.
     * @example
     * // Delete one ShippingOrder
     * const ShippingOrder = await prisma.shippingOrder.delete({
     *   where: {
     *     // ... filter to delete one ShippingOrder
     *   }
     * })
     * 
     */
    delete<T extends ShippingOrderDeleteArgs>(args: SelectSubset<T, ShippingOrderDeleteArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ShippingOrder.
     * @param {ShippingOrderUpdateArgs} args - Arguments to update one ShippingOrder.
     * @example
     * // Update one ShippingOrder
     * const shippingOrder = await prisma.shippingOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShippingOrderUpdateArgs>(args: SelectSubset<T, ShippingOrderUpdateArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ShippingOrders.
     * @param {ShippingOrderDeleteManyArgs} args - Arguments to filter ShippingOrders to delete.
     * @example
     * // Delete a few ShippingOrders
     * const { count } = await prisma.shippingOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShippingOrderDeleteManyArgs>(args?: SelectSubset<T, ShippingOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShippingOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShippingOrders
     * const shippingOrder = await prisma.shippingOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShippingOrderUpdateManyArgs>(args: SelectSubset<T, ShippingOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ShippingOrder.
     * @param {ShippingOrderUpsertArgs} args - Arguments to update or create a ShippingOrder.
     * @example
     * // Update or create a ShippingOrder
     * const shippingOrder = await prisma.shippingOrder.upsert({
     *   create: {
     *     // ... data to create a ShippingOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShippingOrder we want to update
     *   }
     * })
     */
    upsert<T extends ShippingOrderUpsertArgs>(args: SelectSubset<T, ShippingOrderUpsertArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ShippingOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderCountArgs} args - Arguments to filter ShippingOrders to count.
     * @example
     * // Count the number of ShippingOrders
     * const count = await prisma.shippingOrder.count({
     *   where: {
     *     // ... the filter for the ShippingOrders we want to count
     *   }
     * })
    **/
    count<T extends ShippingOrderCountArgs>(
      args?: Subset<T, ShippingOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShippingOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShippingOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShippingOrderAggregateArgs>(args: Subset<T, ShippingOrderAggregateArgs>): Prisma.PrismaPromise<GetShippingOrderAggregateType<T>>

    /**
     * Group by ShippingOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShippingOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShippingOrderGroupByArgs['orderBy'] }
        : { orderBy?: ShippingOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShippingOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShippingOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShippingOrder model
   */
  readonly fields: ShippingOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShippingOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShippingOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    courier<T extends CourierDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CourierDefaultArgs<ExtArgs>>): Prisma__CourierClient<$Result.GetResult<Prisma.$CourierPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    history<T extends ShippingOrder$historyArgs<ExtArgs> = {}>(args?: Subset<T, ShippingOrder$historyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShippingOrder model
   */ 
  interface ShippingOrderFieldRefs {
    readonly id: FieldRef<"ShippingOrder", 'String'>
    readonly orderId: FieldRef<"ShippingOrder", 'String'>
    readonly sellerId: FieldRef<"ShippingOrder", 'String'>
    readonly courierId: FieldRef<"ShippingOrder", 'String'>
    readonly courierName: FieldRef<"ShippingOrder", 'String'>
    readonly serviceCode: FieldRef<"ShippingOrder", 'String'>
    readonly serviceName: FieldRef<"ShippingOrder", 'String'>
    readonly trackingNumber: FieldRef<"ShippingOrder", 'String'>
    readonly originAddress: FieldRef<"ShippingOrder", 'Json'>
    readonly destinationAddress: FieldRef<"ShippingOrder", 'Json'>
    readonly weight: FieldRef<"ShippingOrder", 'Int'>
    readonly cost: FieldRef<"ShippingOrder", 'Decimal'>
    readonly status: FieldRef<"ShippingOrder", 'String'>
    readonly estimatedDelivery: FieldRef<"ShippingOrder", 'String'>
    readonly notes: FieldRef<"ShippingOrder", 'String'>
    readonly shippedAt: FieldRef<"ShippingOrder", 'DateTime'>
    readonly deliveredAt: FieldRef<"ShippingOrder", 'DateTime'>
    readonly createdAt: FieldRef<"ShippingOrder", 'DateTime'>
    readonly updatedAt: FieldRef<"ShippingOrder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShippingOrder findUnique
   */
  export type ShippingOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * Filter, which ShippingOrder to fetch.
     */
    where: ShippingOrderWhereUniqueInput
  }

  /**
   * ShippingOrder findUniqueOrThrow
   */
  export type ShippingOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * Filter, which ShippingOrder to fetch.
     */
    where: ShippingOrderWhereUniqueInput
  }

  /**
   * ShippingOrder findFirst
   */
  export type ShippingOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * Filter, which ShippingOrder to fetch.
     */
    where?: ShippingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingOrders to fetch.
     */
    orderBy?: ShippingOrderOrderByWithRelationInput | ShippingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingOrders.
     */
    cursor?: ShippingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingOrders.
     */
    distinct?: ShippingOrderScalarFieldEnum | ShippingOrderScalarFieldEnum[]
  }

  /**
   * ShippingOrder findFirstOrThrow
   */
  export type ShippingOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * Filter, which ShippingOrder to fetch.
     */
    where?: ShippingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingOrders to fetch.
     */
    orderBy?: ShippingOrderOrderByWithRelationInput | ShippingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingOrders.
     */
    cursor?: ShippingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingOrders.
     */
    distinct?: ShippingOrderScalarFieldEnum | ShippingOrderScalarFieldEnum[]
  }

  /**
   * ShippingOrder findMany
   */
  export type ShippingOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * Filter, which ShippingOrders to fetch.
     */
    where?: ShippingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingOrders to fetch.
     */
    orderBy?: ShippingOrderOrderByWithRelationInput | ShippingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShippingOrders.
     */
    cursor?: ShippingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingOrders.
     */
    skip?: number
    distinct?: ShippingOrderScalarFieldEnum | ShippingOrderScalarFieldEnum[]
  }

  /**
   * ShippingOrder create
   */
  export type ShippingOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * The data needed to create a ShippingOrder.
     */
    data: XOR<ShippingOrderCreateInput, ShippingOrderUncheckedCreateInput>
  }

  /**
   * ShippingOrder createMany
   */
  export type ShippingOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShippingOrders.
     */
    data: ShippingOrderCreateManyInput | ShippingOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShippingOrder createManyAndReturn
   */
  export type ShippingOrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ShippingOrders.
     */
    data: ShippingOrderCreateManyInput | ShippingOrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShippingOrder update
   */
  export type ShippingOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * The data needed to update a ShippingOrder.
     */
    data: XOR<ShippingOrderUpdateInput, ShippingOrderUncheckedUpdateInput>
    /**
     * Choose, which ShippingOrder to update.
     */
    where: ShippingOrderWhereUniqueInput
  }

  /**
   * ShippingOrder updateMany
   */
  export type ShippingOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShippingOrders.
     */
    data: XOR<ShippingOrderUpdateManyMutationInput, ShippingOrderUncheckedUpdateManyInput>
    /**
     * Filter which ShippingOrders to update
     */
    where?: ShippingOrderWhereInput
  }

  /**
   * ShippingOrder upsert
   */
  export type ShippingOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * The filter to search for the ShippingOrder to update in case it exists.
     */
    where: ShippingOrderWhereUniqueInput
    /**
     * In case the ShippingOrder found by the `where` argument doesn't exist, create a new ShippingOrder with this data.
     */
    create: XOR<ShippingOrderCreateInput, ShippingOrderUncheckedCreateInput>
    /**
     * In case the ShippingOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShippingOrderUpdateInput, ShippingOrderUncheckedUpdateInput>
  }

  /**
   * ShippingOrder delete
   */
  export type ShippingOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
    /**
     * Filter which ShippingOrder to delete.
     */
    where: ShippingOrderWhereUniqueInput
  }

  /**
   * ShippingOrder deleteMany
   */
  export type ShippingOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingOrders to delete
     */
    where?: ShippingOrderWhereInput
  }

  /**
   * ShippingOrder.history
   */
  export type ShippingOrder$historyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    where?: ShippingStatusHistoryWhereInput
    orderBy?: ShippingStatusHistoryOrderByWithRelationInput | ShippingStatusHistoryOrderByWithRelationInput[]
    cursor?: ShippingStatusHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShippingStatusHistoryScalarFieldEnum | ShippingStatusHistoryScalarFieldEnum[]
  }

  /**
   * ShippingOrder without action
   */
  export type ShippingOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingOrder
     */
    select?: ShippingOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingOrderInclude<ExtArgs> | null
  }


  /**
   * Model ShippingStatusHistory
   */

  export type AggregateShippingStatusHistory = {
    _count: ShippingStatusHistoryCountAggregateOutputType | null
    _min: ShippingStatusHistoryMinAggregateOutputType | null
    _max: ShippingStatusHistoryMaxAggregateOutputType | null
  }

  export type ShippingStatusHistoryMinAggregateOutputType = {
    id: string | null
    shippingOrderId: string | null
    fromStatus: string | null
    toStatus: string | null
    location: string | null
    note: string | null
    updatedBy: string | null
    createdAt: Date | null
  }

  export type ShippingStatusHistoryMaxAggregateOutputType = {
    id: string | null
    shippingOrderId: string | null
    fromStatus: string | null
    toStatus: string | null
    location: string | null
    note: string | null
    updatedBy: string | null
    createdAt: Date | null
  }

  export type ShippingStatusHistoryCountAggregateOutputType = {
    id: number
    shippingOrderId: number
    fromStatus: number
    toStatus: number
    location: number
    note: number
    updatedBy: number
    createdAt: number
    _all: number
  }


  export type ShippingStatusHistoryMinAggregateInputType = {
    id?: true
    shippingOrderId?: true
    fromStatus?: true
    toStatus?: true
    location?: true
    note?: true
    updatedBy?: true
    createdAt?: true
  }

  export type ShippingStatusHistoryMaxAggregateInputType = {
    id?: true
    shippingOrderId?: true
    fromStatus?: true
    toStatus?: true
    location?: true
    note?: true
    updatedBy?: true
    createdAt?: true
  }

  export type ShippingStatusHistoryCountAggregateInputType = {
    id?: true
    shippingOrderId?: true
    fromStatus?: true
    toStatus?: true
    location?: true
    note?: true
    updatedBy?: true
    createdAt?: true
    _all?: true
  }

  export type ShippingStatusHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingStatusHistory to aggregate.
     */
    where?: ShippingStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingStatusHistories to fetch.
     */
    orderBy?: ShippingStatusHistoryOrderByWithRelationInput | ShippingStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShippingStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingStatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShippingStatusHistories
    **/
    _count?: true | ShippingStatusHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShippingStatusHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShippingStatusHistoryMaxAggregateInputType
  }

  export type GetShippingStatusHistoryAggregateType<T extends ShippingStatusHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateShippingStatusHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShippingStatusHistory[P]>
      : GetScalarType<T[P], AggregateShippingStatusHistory[P]>
  }




  export type ShippingStatusHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingStatusHistoryWhereInput
    orderBy?: ShippingStatusHistoryOrderByWithAggregationInput | ShippingStatusHistoryOrderByWithAggregationInput[]
    by: ShippingStatusHistoryScalarFieldEnum[] | ShippingStatusHistoryScalarFieldEnum
    having?: ShippingStatusHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShippingStatusHistoryCountAggregateInputType | true
    _min?: ShippingStatusHistoryMinAggregateInputType
    _max?: ShippingStatusHistoryMaxAggregateInputType
  }

  export type ShippingStatusHistoryGroupByOutputType = {
    id: string
    shippingOrderId: string
    fromStatus: string | null
    toStatus: string
    location: string | null
    note: string | null
    updatedBy: string | null
    createdAt: Date
    _count: ShippingStatusHistoryCountAggregateOutputType | null
    _min: ShippingStatusHistoryMinAggregateOutputType | null
    _max: ShippingStatusHistoryMaxAggregateOutputType | null
  }

  type GetShippingStatusHistoryGroupByPayload<T extends ShippingStatusHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShippingStatusHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShippingStatusHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShippingStatusHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], ShippingStatusHistoryGroupByOutputType[P]>
        }
      >
    >


  export type ShippingStatusHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shippingOrderId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    location?: boolean
    note?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    shippingOrder?: boolean | ShippingOrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shippingStatusHistory"]>

  export type ShippingStatusHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    shippingOrderId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    location?: boolean
    note?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    shippingOrder?: boolean | ShippingOrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shippingStatusHistory"]>

  export type ShippingStatusHistorySelectScalar = {
    id?: boolean
    shippingOrderId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    location?: boolean
    note?: boolean
    updatedBy?: boolean
    createdAt?: boolean
  }

  export type ShippingStatusHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shippingOrder?: boolean | ShippingOrderDefaultArgs<ExtArgs>
  }
  export type ShippingStatusHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shippingOrder?: boolean | ShippingOrderDefaultArgs<ExtArgs>
  }

  export type $ShippingStatusHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShippingStatusHistory"
    objects: {
      shippingOrder: Prisma.$ShippingOrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      shippingOrderId: string
      fromStatus: string | null
      toStatus: string
      location: string | null
      note: string | null
      updatedBy: string | null
      createdAt: Date
    }, ExtArgs["result"]["shippingStatusHistory"]>
    composites: {}
  }

  type ShippingStatusHistoryGetPayload<S extends boolean | null | undefined | ShippingStatusHistoryDefaultArgs> = $Result.GetResult<Prisma.$ShippingStatusHistoryPayload, S>

  type ShippingStatusHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShippingStatusHistoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShippingStatusHistoryCountAggregateInputType | true
    }

  export interface ShippingStatusHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShippingStatusHistory'], meta: { name: 'ShippingStatusHistory' } }
    /**
     * Find zero or one ShippingStatusHistory that matches the filter.
     * @param {ShippingStatusHistoryFindUniqueArgs} args - Arguments to find a ShippingStatusHistory
     * @example
     * // Get one ShippingStatusHistory
     * const shippingStatusHistory = await prisma.shippingStatusHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShippingStatusHistoryFindUniqueArgs>(args: SelectSubset<T, ShippingStatusHistoryFindUniqueArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ShippingStatusHistory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ShippingStatusHistoryFindUniqueOrThrowArgs} args - Arguments to find a ShippingStatusHistory
     * @example
     * // Get one ShippingStatusHistory
     * const shippingStatusHistory = await prisma.shippingStatusHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShippingStatusHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, ShippingStatusHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ShippingStatusHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryFindFirstArgs} args - Arguments to find a ShippingStatusHistory
     * @example
     * // Get one ShippingStatusHistory
     * const shippingStatusHistory = await prisma.shippingStatusHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShippingStatusHistoryFindFirstArgs>(args?: SelectSubset<T, ShippingStatusHistoryFindFirstArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ShippingStatusHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryFindFirstOrThrowArgs} args - Arguments to find a ShippingStatusHistory
     * @example
     * // Get one ShippingStatusHistory
     * const shippingStatusHistory = await prisma.shippingStatusHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShippingStatusHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, ShippingStatusHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ShippingStatusHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShippingStatusHistories
     * const shippingStatusHistories = await prisma.shippingStatusHistory.findMany()
     * 
     * // Get first 10 ShippingStatusHistories
     * const shippingStatusHistories = await prisma.shippingStatusHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shippingStatusHistoryWithIdOnly = await prisma.shippingStatusHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShippingStatusHistoryFindManyArgs>(args?: SelectSubset<T, ShippingStatusHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ShippingStatusHistory.
     * @param {ShippingStatusHistoryCreateArgs} args - Arguments to create a ShippingStatusHistory.
     * @example
     * // Create one ShippingStatusHistory
     * const ShippingStatusHistory = await prisma.shippingStatusHistory.create({
     *   data: {
     *     // ... data to create a ShippingStatusHistory
     *   }
     * })
     * 
     */
    create<T extends ShippingStatusHistoryCreateArgs>(args: SelectSubset<T, ShippingStatusHistoryCreateArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ShippingStatusHistories.
     * @param {ShippingStatusHistoryCreateManyArgs} args - Arguments to create many ShippingStatusHistories.
     * @example
     * // Create many ShippingStatusHistories
     * const shippingStatusHistory = await prisma.shippingStatusHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShippingStatusHistoryCreateManyArgs>(args?: SelectSubset<T, ShippingStatusHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShippingStatusHistories and returns the data saved in the database.
     * @param {ShippingStatusHistoryCreateManyAndReturnArgs} args - Arguments to create many ShippingStatusHistories.
     * @example
     * // Create many ShippingStatusHistories
     * const shippingStatusHistory = await prisma.shippingStatusHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShippingStatusHistories and only return the `id`
     * const shippingStatusHistoryWithIdOnly = await prisma.shippingStatusHistory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShippingStatusHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, ShippingStatusHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ShippingStatusHistory.
     * @param {ShippingStatusHistoryDeleteArgs} args - Arguments to delete one ShippingStatusHistory.
     * @example
     * // Delete one ShippingStatusHistory
     * const ShippingStatusHistory = await prisma.shippingStatusHistory.delete({
     *   where: {
     *     // ... filter to delete one ShippingStatusHistory
     *   }
     * })
     * 
     */
    delete<T extends ShippingStatusHistoryDeleteArgs>(args: SelectSubset<T, ShippingStatusHistoryDeleteArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ShippingStatusHistory.
     * @param {ShippingStatusHistoryUpdateArgs} args - Arguments to update one ShippingStatusHistory.
     * @example
     * // Update one ShippingStatusHistory
     * const shippingStatusHistory = await prisma.shippingStatusHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShippingStatusHistoryUpdateArgs>(args: SelectSubset<T, ShippingStatusHistoryUpdateArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ShippingStatusHistories.
     * @param {ShippingStatusHistoryDeleteManyArgs} args - Arguments to filter ShippingStatusHistories to delete.
     * @example
     * // Delete a few ShippingStatusHistories
     * const { count } = await prisma.shippingStatusHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShippingStatusHistoryDeleteManyArgs>(args?: SelectSubset<T, ShippingStatusHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShippingStatusHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShippingStatusHistories
     * const shippingStatusHistory = await prisma.shippingStatusHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShippingStatusHistoryUpdateManyArgs>(args: SelectSubset<T, ShippingStatusHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ShippingStatusHistory.
     * @param {ShippingStatusHistoryUpsertArgs} args - Arguments to update or create a ShippingStatusHistory.
     * @example
     * // Update or create a ShippingStatusHistory
     * const shippingStatusHistory = await prisma.shippingStatusHistory.upsert({
     *   create: {
     *     // ... data to create a ShippingStatusHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShippingStatusHistory we want to update
     *   }
     * })
     */
    upsert<T extends ShippingStatusHistoryUpsertArgs>(args: SelectSubset<T, ShippingStatusHistoryUpsertArgs<ExtArgs>>): Prisma__ShippingStatusHistoryClient<$Result.GetResult<Prisma.$ShippingStatusHistoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ShippingStatusHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryCountArgs} args - Arguments to filter ShippingStatusHistories to count.
     * @example
     * // Count the number of ShippingStatusHistories
     * const count = await prisma.shippingStatusHistory.count({
     *   where: {
     *     // ... the filter for the ShippingStatusHistories we want to count
     *   }
     * })
    **/
    count<T extends ShippingStatusHistoryCountArgs>(
      args?: Subset<T, ShippingStatusHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShippingStatusHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShippingStatusHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShippingStatusHistoryAggregateArgs>(args: Subset<T, ShippingStatusHistoryAggregateArgs>): Prisma.PrismaPromise<GetShippingStatusHistoryAggregateType<T>>

    /**
     * Group by ShippingStatusHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingStatusHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShippingStatusHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShippingStatusHistoryGroupByArgs['orderBy'] }
        : { orderBy?: ShippingStatusHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShippingStatusHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShippingStatusHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShippingStatusHistory model
   */
  readonly fields: ShippingStatusHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShippingStatusHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShippingStatusHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    shippingOrder<T extends ShippingOrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ShippingOrderDefaultArgs<ExtArgs>>): Prisma__ShippingOrderClient<$Result.GetResult<Prisma.$ShippingOrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShippingStatusHistory model
   */ 
  interface ShippingStatusHistoryFieldRefs {
    readonly id: FieldRef<"ShippingStatusHistory", 'String'>
    readonly shippingOrderId: FieldRef<"ShippingStatusHistory", 'String'>
    readonly fromStatus: FieldRef<"ShippingStatusHistory", 'String'>
    readonly toStatus: FieldRef<"ShippingStatusHistory", 'String'>
    readonly location: FieldRef<"ShippingStatusHistory", 'String'>
    readonly note: FieldRef<"ShippingStatusHistory", 'String'>
    readonly updatedBy: FieldRef<"ShippingStatusHistory", 'String'>
    readonly createdAt: FieldRef<"ShippingStatusHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShippingStatusHistory findUnique
   */
  export type ShippingStatusHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which ShippingStatusHistory to fetch.
     */
    where: ShippingStatusHistoryWhereUniqueInput
  }

  /**
   * ShippingStatusHistory findUniqueOrThrow
   */
  export type ShippingStatusHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which ShippingStatusHistory to fetch.
     */
    where: ShippingStatusHistoryWhereUniqueInput
  }

  /**
   * ShippingStatusHistory findFirst
   */
  export type ShippingStatusHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which ShippingStatusHistory to fetch.
     */
    where?: ShippingStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingStatusHistories to fetch.
     */
    orderBy?: ShippingStatusHistoryOrderByWithRelationInput | ShippingStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingStatusHistories.
     */
    cursor?: ShippingStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingStatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingStatusHistories.
     */
    distinct?: ShippingStatusHistoryScalarFieldEnum | ShippingStatusHistoryScalarFieldEnum[]
  }

  /**
   * ShippingStatusHistory findFirstOrThrow
   */
  export type ShippingStatusHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which ShippingStatusHistory to fetch.
     */
    where?: ShippingStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingStatusHistories to fetch.
     */
    orderBy?: ShippingStatusHistoryOrderByWithRelationInput | ShippingStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingStatusHistories.
     */
    cursor?: ShippingStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingStatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingStatusHistories.
     */
    distinct?: ShippingStatusHistoryScalarFieldEnum | ShippingStatusHistoryScalarFieldEnum[]
  }

  /**
   * ShippingStatusHistory findMany
   */
  export type ShippingStatusHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which ShippingStatusHistories to fetch.
     */
    where?: ShippingStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingStatusHistories to fetch.
     */
    orderBy?: ShippingStatusHistoryOrderByWithRelationInput | ShippingStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShippingStatusHistories.
     */
    cursor?: ShippingStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingStatusHistories.
     */
    skip?: number
    distinct?: ShippingStatusHistoryScalarFieldEnum | ShippingStatusHistoryScalarFieldEnum[]
  }

  /**
   * ShippingStatusHistory create
   */
  export type ShippingStatusHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a ShippingStatusHistory.
     */
    data: XOR<ShippingStatusHistoryCreateInput, ShippingStatusHistoryUncheckedCreateInput>
  }

  /**
   * ShippingStatusHistory createMany
   */
  export type ShippingStatusHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShippingStatusHistories.
     */
    data: ShippingStatusHistoryCreateManyInput | ShippingStatusHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShippingStatusHistory createManyAndReturn
   */
  export type ShippingStatusHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ShippingStatusHistories.
     */
    data: ShippingStatusHistoryCreateManyInput | ShippingStatusHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShippingStatusHistory update
   */
  export type ShippingStatusHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a ShippingStatusHistory.
     */
    data: XOR<ShippingStatusHistoryUpdateInput, ShippingStatusHistoryUncheckedUpdateInput>
    /**
     * Choose, which ShippingStatusHistory to update.
     */
    where: ShippingStatusHistoryWhereUniqueInput
  }

  /**
   * ShippingStatusHistory updateMany
   */
  export type ShippingStatusHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShippingStatusHistories.
     */
    data: XOR<ShippingStatusHistoryUpdateManyMutationInput, ShippingStatusHistoryUncheckedUpdateManyInput>
    /**
     * Filter which ShippingStatusHistories to update
     */
    where?: ShippingStatusHistoryWhereInput
  }

  /**
   * ShippingStatusHistory upsert
   */
  export type ShippingStatusHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the ShippingStatusHistory to update in case it exists.
     */
    where: ShippingStatusHistoryWhereUniqueInput
    /**
     * In case the ShippingStatusHistory found by the `where` argument doesn't exist, create a new ShippingStatusHistory with this data.
     */
    create: XOR<ShippingStatusHistoryCreateInput, ShippingStatusHistoryUncheckedCreateInput>
    /**
     * In case the ShippingStatusHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShippingStatusHistoryUpdateInput, ShippingStatusHistoryUncheckedUpdateInput>
  }

  /**
   * ShippingStatusHistory delete
   */
  export type ShippingStatusHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter which ShippingStatusHistory to delete.
     */
    where: ShippingStatusHistoryWhereUniqueInput
  }

  /**
   * ShippingStatusHistory deleteMany
   */
  export type ShippingStatusHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingStatusHistories to delete
     */
    where?: ShippingStatusHistoryWhereInput
  }

  /**
   * ShippingStatusHistory without action
   */
  export type ShippingStatusHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingStatusHistory
     */
    select?: ShippingStatusHistorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShippingStatusHistoryInclude<ExtArgs> | null
  }


  /**
   * Model OutboxEvent
   */

  export type AggregateOutboxEvent = {
    _count: OutboxEventCountAggregateOutputType | null
    _avg: OutboxEventAvgAggregateOutputType | null
    _sum: OutboxEventSumAggregateOutputType | null
    _min: OutboxEventMinAggregateOutputType | null
    _max: OutboxEventMaxAggregateOutputType | null
  }

  export type OutboxEventAvgAggregateOutputType = {
    attempts: number | null
  }

  export type OutboxEventSumAggregateOutputType = {
    attempts: number | null
  }

  export type OutboxEventMinAggregateOutputType = {
    id: string | null
    aggregateType: string | null
    aggregateId: string | null
    eventName: string | null
    routingKey: string | null
    status: string | null
    attempts: number | null
    availableAt: Date | null
    lockedAt: Date | null
    lockToken: string | null
    publishedAt: Date | null
    lastError: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutboxEventMaxAggregateOutputType = {
    id: string | null
    aggregateType: string | null
    aggregateId: string | null
    eventName: string | null
    routingKey: string | null
    status: string | null
    attempts: number | null
    availableAt: Date | null
    lockedAt: Date | null
    lockToken: string | null
    publishedAt: Date | null
    lastError: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutboxEventCountAggregateOutputType = {
    id: number
    aggregateType: number
    aggregateId: number
    eventName: number
    routingKey: number
    eventPayload: number
    status: number
    attempts: number
    availableAt: number
    lockedAt: number
    lockToken: number
    publishedAt: number
    lastError: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OutboxEventAvgAggregateInputType = {
    attempts?: true
  }

  export type OutboxEventSumAggregateInputType = {
    attempts?: true
  }

  export type OutboxEventMinAggregateInputType = {
    id?: true
    aggregateType?: true
    aggregateId?: true
    eventName?: true
    routingKey?: true
    status?: true
    attempts?: true
    availableAt?: true
    lockedAt?: true
    lockToken?: true
    publishedAt?: true
    lastError?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutboxEventMaxAggregateInputType = {
    id?: true
    aggregateType?: true
    aggregateId?: true
    eventName?: true
    routingKey?: true
    status?: true
    attempts?: true
    availableAt?: true
    lockedAt?: true
    lockToken?: true
    publishedAt?: true
    lastError?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutboxEventCountAggregateInputType = {
    id?: true
    aggregateType?: true
    aggregateId?: true
    eventName?: true
    routingKey?: true
    eventPayload?: true
    status?: true
    attempts?: true
    availableAt?: true
    lockedAt?: true
    lockToken?: true
    publishedAt?: true
    lastError?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OutboxEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutboxEvent to aggregate.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutboxEvents
    **/
    _count?: true | OutboxEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutboxEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutboxEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutboxEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutboxEventMaxAggregateInputType
  }

  export type GetOutboxEventAggregateType<T extends OutboxEventAggregateArgs> = {
        [P in keyof T & keyof AggregateOutboxEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutboxEvent[P]>
      : GetScalarType<T[P], AggregateOutboxEvent[P]>
  }




  export type OutboxEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutboxEventWhereInput
    orderBy?: OutboxEventOrderByWithAggregationInput | OutboxEventOrderByWithAggregationInput[]
    by: OutboxEventScalarFieldEnum[] | OutboxEventScalarFieldEnum
    having?: OutboxEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutboxEventCountAggregateInputType | true
    _avg?: OutboxEventAvgAggregateInputType
    _sum?: OutboxEventSumAggregateInputType
    _min?: OutboxEventMinAggregateInputType
    _max?: OutboxEventMaxAggregateInputType
  }

  export type OutboxEventGroupByOutputType = {
    id: string
    aggregateType: string
    aggregateId: string
    eventName: string
    routingKey: string
    eventPayload: JsonValue
    status: string
    attempts: number
    availableAt: Date
    lockedAt: Date | null
    lockToken: string | null
    publishedAt: Date | null
    lastError: string | null
    createdAt: Date
    updatedAt: Date
    _count: OutboxEventCountAggregateOutputType | null
    _avg: OutboxEventAvgAggregateOutputType | null
    _sum: OutboxEventSumAggregateOutputType | null
    _min: OutboxEventMinAggregateOutputType | null
    _max: OutboxEventMaxAggregateOutputType | null
  }

  type GetOutboxEventGroupByPayload<T extends OutboxEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutboxEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutboxEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutboxEventGroupByOutputType[P]>
            : GetScalarType<T[P], OutboxEventGroupByOutputType[P]>
        }
      >
    >


  export type OutboxEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    aggregateType?: boolean
    aggregateId?: boolean
    eventName?: boolean
    routingKey?: boolean
    eventPayload?: boolean
    status?: boolean
    attempts?: boolean
    availableAt?: boolean
    lockedAt?: boolean
    lockToken?: boolean
    publishedAt?: boolean
    lastError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["outboxEvent"]>

  export type OutboxEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    aggregateType?: boolean
    aggregateId?: boolean
    eventName?: boolean
    routingKey?: boolean
    eventPayload?: boolean
    status?: boolean
    attempts?: boolean
    availableAt?: boolean
    lockedAt?: boolean
    lockToken?: boolean
    publishedAt?: boolean
    lastError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["outboxEvent"]>

  export type OutboxEventSelectScalar = {
    id?: boolean
    aggregateType?: boolean
    aggregateId?: boolean
    eventName?: boolean
    routingKey?: boolean
    eventPayload?: boolean
    status?: boolean
    attempts?: boolean
    availableAt?: boolean
    lockedAt?: boolean
    lockToken?: boolean
    publishedAt?: boolean
    lastError?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $OutboxEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutboxEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      aggregateType: string
      aggregateId: string
      eventName: string
      routingKey: string
      eventPayload: Prisma.JsonValue
      status: string
      attempts: number
      availableAt: Date
      lockedAt: Date | null
      lockToken: string | null
      publishedAt: Date | null
      lastError: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["outboxEvent"]>
    composites: {}
  }

  type OutboxEventGetPayload<S extends boolean | null | undefined | OutboxEventDefaultArgs> = $Result.GetResult<Prisma.$OutboxEventPayload, S>

  type OutboxEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OutboxEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OutboxEventCountAggregateInputType | true
    }

  export interface OutboxEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutboxEvent'], meta: { name: 'OutboxEvent' } }
    /**
     * Find zero or one OutboxEvent that matches the filter.
     * @param {OutboxEventFindUniqueArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutboxEventFindUniqueArgs>(args: SelectSubset<T, OutboxEventFindUniqueArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OutboxEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OutboxEventFindUniqueOrThrowArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutboxEventFindUniqueOrThrowArgs>(args: SelectSubset<T, OutboxEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OutboxEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventFindFirstArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutboxEventFindFirstArgs>(args?: SelectSubset<T, OutboxEventFindFirstArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OutboxEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventFindFirstOrThrowArgs} args - Arguments to find a OutboxEvent
     * @example
     * // Get one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutboxEventFindFirstOrThrowArgs>(args?: SelectSubset<T, OutboxEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OutboxEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutboxEvents
     * const outboxEvents = await prisma.outboxEvent.findMany()
     * 
     * // Get first 10 OutboxEvents
     * const outboxEvents = await prisma.outboxEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outboxEventWithIdOnly = await prisma.outboxEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutboxEventFindManyArgs>(args?: SelectSubset<T, OutboxEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OutboxEvent.
     * @param {OutboxEventCreateArgs} args - Arguments to create a OutboxEvent.
     * @example
     * // Create one OutboxEvent
     * const OutboxEvent = await prisma.outboxEvent.create({
     *   data: {
     *     // ... data to create a OutboxEvent
     *   }
     * })
     * 
     */
    create<T extends OutboxEventCreateArgs>(args: SelectSubset<T, OutboxEventCreateArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OutboxEvents.
     * @param {OutboxEventCreateManyArgs} args - Arguments to create many OutboxEvents.
     * @example
     * // Create many OutboxEvents
     * const outboxEvent = await prisma.outboxEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutboxEventCreateManyArgs>(args?: SelectSubset<T, OutboxEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutboxEvents and returns the data saved in the database.
     * @param {OutboxEventCreateManyAndReturnArgs} args - Arguments to create many OutboxEvents.
     * @example
     * // Create many OutboxEvents
     * const outboxEvent = await prisma.outboxEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutboxEvents and only return the `id`
     * const outboxEventWithIdOnly = await prisma.outboxEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutboxEventCreateManyAndReturnArgs>(args?: SelectSubset<T, OutboxEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OutboxEvent.
     * @param {OutboxEventDeleteArgs} args - Arguments to delete one OutboxEvent.
     * @example
     * // Delete one OutboxEvent
     * const OutboxEvent = await prisma.outboxEvent.delete({
     *   where: {
     *     // ... filter to delete one OutboxEvent
     *   }
     * })
     * 
     */
    delete<T extends OutboxEventDeleteArgs>(args: SelectSubset<T, OutboxEventDeleteArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OutboxEvent.
     * @param {OutboxEventUpdateArgs} args - Arguments to update one OutboxEvent.
     * @example
     * // Update one OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutboxEventUpdateArgs>(args: SelectSubset<T, OutboxEventUpdateArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OutboxEvents.
     * @param {OutboxEventDeleteManyArgs} args - Arguments to filter OutboxEvents to delete.
     * @example
     * // Delete a few OutboxEvents
     * const { count } = await prisma.outboxEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutboxEventDeleteManyArgs>(args?: SelectSubset<T, OutboxEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutboxEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutboxEvents
     * const outboxEvent = await prisma.outboxEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutboxEventUpdateManyArgs>(args: SelectSubset<T, OutboxEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OutboxEvent.
     * @param {OutboxEventUpsertArgs} args - Arguments to update or create a OutboxEvent.
     * @example
     * // Update or create a OutboxEvent
     * const outboxEvent = await prisma.outboxEvent.upsert({
     *   create: {
     *     // ... data to create a OutboxEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutboxEvent we want to update
     *   }
     * })
     */
    upsert<T extends OutboxEventUpsertArgs>(args: SelectSubset<T, OutboxEventUpsertArgs<ExtArgs>>): Prisma__OutboxEventClient<$Result.GetResult<Prisma.$OutboxEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OutboxEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventCountArgs} args - Arguments to filter OutboxEvents to count.
     * @example
     * // Count the number of OutboxEvents
     * const count = await prisma.outboxEvent.count({
     *   where: {
     *     // ... the filter for the OutboxEvents we want to count
     *   }
     * })
    **/
    count<T extends OutboxEventCountArgs>(
      args?: Subset<T, OutboxEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutboxEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutboxEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutboxEventAggregateArgs>(args: Subset<T, OutboxEventAggregateArgs>): Prisma.PrismaPromise<GetOutboxEventAggregateType<T>>

    /**
     * Group by OutboxEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutboxEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutboxEventGroupByArgs['orderBy'] }
        : { orderBy?: OutboxEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutboxEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutboxEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutboxEvent model
   */
  readonly fields: OutboxEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutboxEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutboxEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OutboxEvent model
   */ 
  interface OutboxEventFieldRefs {
    readonly id: FieldRef<"OutboxEvent", 'String'>
    readonly aggregateType: FieldRef<"OutboxEvent", 'String'>
    readonly aggregateId: FieldRef<"OutboxEvent", 'String'>
    readonly eventName: FieldRef<"OutboxEvent", 'String'>
    readonly routingKey: FieldRef<"OutboxEvent", 'String'>
    readonly eventPayload: FieldRef<"OutboxEvent", 'Json'>
    readonly status: FieldRef<"OutboxEvent", 'String'>
    readonly attempts: FieldRef<"OutboxEvent", 'Int'>
    readonly availableAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly lockedAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly lockToken: FieldRef<"OutboxEvent", 'String'>
    readonly publishedAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly lastError: FieldRef<"OutboxEvent", 'String'>
    readonly createdAt: FieldRef<"OutboxEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"OutboxEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OutboxEvent findUnique
   */
  export type OutboxEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent findUniqueOrThrow
   */
  export type OutboxEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent findFirst
   */
  export type OutboxEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutboxEvents.
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutboxEvents.
     */
    distinct?: OutboxEventScalarFieldEnum | OutboxEventScalarFieldEnum[]
  }

  /**
   * OutboxEvent findFirstOrThrow
   */
  export type OutboxEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvent to fetch.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutboxEvents.
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutboxEvents.
     */
    distinct?: OutboxEventScalarFieldEnum | OutboxEventScalarFieldEnum[]
  }

  /**
   * OutboxEvent findMany
   */
  export type OutboxEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter, which OutboxEvents to fetch.
     */
    where?: OutboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutboxEvents to fetch.
     */
    orderBy?: OutboxEventOrderByWithRelationInput | OutboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutboxEvents.
     */
    cursor?: OutboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutboxEvents.
     */
    skip?: number
    distinct?: OutboxEventScalarFieldEnum | OutboxEventScalarFieldEnum[]
  }

  /**
   * OutboxEvent create
   */
  export type OutboxEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * The data needed to create a OutboxEvent.
     */
    data: XOR<OutboxEventCreateInput, OutboxEventUncheckedCreateInput>
  }

  /**
   * OutboxEvent createMany
   */
  export type OutboxEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutboxEvents.
     */
    data: OutboxEventCreateManyInput | OutboxEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutboxEvent createManyAndReturn
   */
  export type OutboxEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OutboxEvents.
     */
    data: OutboxEventCreateManyInput | OutboxEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutboxEvent update
   */
  export type OutboxEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * The data needed to update a OutboxEvent.
     */
    data: XOR<OutboxEventUpdateInput, OutboxEventUncheckedUpdateInput>
    /**
     * Choose, which OutboxEvent to update.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent updateMany
   */
  export type OutboxEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutboxEvents.
     */
    data: XOR<OutboxEventUpdateManyMutationInput, OutboxEventUncheckedUpdateManyInput>
    /**
     * Filter which OutboxEvents to update
     */
    where?: OutboxEventWhereInput
  }

  /**
   * OutboxEvent upsert
   */
  export type OutboxEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * The filter to search for the OutboxEvent to update in case it exists.
     */
    where: OutboxEventWhereUniqueInput
    /**
     * In case the OutboxEvent found by the `where` argument doesn't exist, create a new OutboxEvent with this data.
     */
    create: XOR<OutboxEventCreateInput, OutboxEventUncheckedCreateInput>
    /**
     * In case the OutboxEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutboxEventUpdateInput, OutboxEventUncheckedUpdateInput>
  }

  /**
   * OutboxEvent delete
   */
  export type OutboxEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
    /**
     * Filter which OutboxEvent to delete.
     */
    where: OutboxEventWhereUniqueInput
  }

  /**
   * OutboxEvent deleteMany
   */
  export type OutboxEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutboxEvents to delete
     */
    where?: OutboxEventWhereInput
  }

  /**
   * OutboxEvent without action
   */
  export type OutboxEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutboxEvent
     */
    select?: OutboxEventSelect<ExtArgs> | null
  }


  /**
   * Model ShippingQuote
   */

  export type AggregateShippingQuote = {
    _count: ShippingQuoteCountAggregateOutputType | null
    _avg: ShippingQuoteAvgAggregateOutputType | null
    _sum: ShippingQuoteSumAggregateOutputType | null
    _min: ShippingQuoteMinAggregateOutputType | null
    _max: ShippingQuoteMaxAggregateOutputType | null
  }

  export type ShippingQuoteAvgAggregateOutputType = {
    totalCost: Decimal | null
  }

  export type ShippingQuoteSumAggregateOutputType = {
    totalCost: Decimal | null
  }

  export type ShippingQuoteMinAggregateOutputType = {
    id: string | null
    customerId: string | null
    totalCost: Decimal | null
    cartHash: string | null
    status: string | null
    expiresAt: Date | null
    consumedAt: Date | null
    consumedBy: string | null
    createdAt: Date | null
  }

  export type ShippingQuoteMaxAggregateOutputType = {
    id: string | null
    customerId: string | null
    totalCost: Decimal | null
    cartHash: string | null
    status: string | null
    expiresAt: Date | null
    consumedAt: Date | null
    consumedBy: string | null
    createdAt: Date | null
  }

  export type ShippingQuoteCountAggregateOutputType = {
    id: number
    customerId: number
    destination: number
    shipments: number
    totalCost: number
    cartHash: number
    status: number
    expiresAt: number
    consumedAt: number
    consumedBy: number
    createdAt: number
    _all: number
  }


  export type ShippingQuoteAvgAggregateInputType = {
    totalCost?: true
  }

  export type ShippingQuoteSumAggregateInputType = {
    totalCost?: true
  }

  export type ShippingQuoteMinAggregateInputType = {
    id?: true
    customerId?: true
    totalCost?: true
    cartHash?: true
    status?: true
    expiresAt?: true
    consumedAt?: true
    consumedBy?: true
    createdAt?: true
  }

  export type ShippingQuoteMaxAggregateInputType = {
    id?: true
    customerId?: true
    totalCost?: true
    cartHash?: true
    status?: true
    expiresAt?: true
    consumedAt?: true
    consumedBy?: true
    createdAt?: true
  }

  export type ShippingQuoteCountAggregateInputType = {
    id?: true
    customerId?: true
    destination?: true
    shipments?: true
    totalCost?: true
    cartHash?: true
    status?: true
    expiresAt?: true
    consumedAt?: true
    consumedBy?: true
    createdAt?: true
    _all?: true
  }

  export type ShippingQuoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingQuote to aggregate.
     */
    where?: ShippingQuoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingQuotes to fetch.
     */
    orderBy?: ShippingQuoteOrderByWithRelationInput | ShippingQuoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShippingQuoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingQuotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingQuotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShippingQuotes
    **/
    _count?: true | ShippingQuoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShippingQuoteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShippingQuoteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShippingQuoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShippingQuoteMaxAggregateInputType
  }

  export type GetShippingQuoteAggregateType<T extends ShippingQuoteAggregateArgs> = {
        [P in keyof T & keyof AggregateShippingQuote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShippingQuote[P]>
      : GetScalarType<T[P], AggregateShippingQuote[P]>
  }




  export type ShippingQuoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShippingQuoteWhereInput
    orderBy?: ShippingQuoteOrderByWithAggregationInput | ShippingQuoteOrderByWithAggregationInput[]
    by: ShippingQuoteScalarFieldEnum[] | ShippingQuoteScalarFieldEnum
    having?: ShippingQuoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShippingQuoteCountAggregateInputType | true
    _avg?: ShippingQuoteAvgAggregateInputType
    _sum?: ShippingQuoteSumAggregateInputType
    _min?: ShippingQuoteMinAggregateInputType
    _max?: ShippingQuoteMaxAggregateInputType
  }

  export type ShippingQuoteGroupByOutputType = {
    id: string
    customerId: string
    destination: JsonValue
    shipments: JsonValue
    totalCost: Decimal
    cartHash: string
    status: string
    expiresAt: Date
    consumedAt: Date | null
    consumedBy: string | null
    createdAt: Date
    _count: ShippingQuoteCountAggregateOutputType | null
    _avg: ShippingQuoteAvgAggregateOutputType | null
    _sum: ShippingQuoteSumAggregateOutputType | null
    _min: ShippingQuoteMinAggregateOutputType | null
    _max: ShippingQuoteMaxAggregateOutputType | null
  }

  type GetShippingQuoteGroupByPayload<T extends ShippingQuoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShippingQuoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShippingQuoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShippingQuoteGroupByOutputType[P]>
            : GetScalarType<T[P], ShippingQuoteGroupByOutputType[P]>
        }
      >
    >


  export type ShippingQuoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    destination?: boolean
    shipments?: boolean
    totalCost?: boolean
    cartHash?: boolean
    status?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    consumedBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["shippingQuote"]>

  export type ShippingQuoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    destination?: boolean
    shipments?: boolean
    totalCost?: boolean
    cartHash?: boolean
    status?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    consumedBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["shippingQuote"]>

  export type ShippingQuoteSelectScalar = {
    id?: boolean
    customerId?: boolean
    destination?: boolean
    shipments?: boolean
    totalCost?: boolean
    cartHash?: boolean
    status?: boolean
    expiresAt?: boolean
    consumedAt?: boolean
    consumedBy?: boolean
    createdAt?: boolean
  }


  export type $ShippingQuotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShippingQuote"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customerId: string
      /**
       * Destination snapshot: { addressId, city, province, postalCode }.
       */
      destination: Prisma.JsonValue
      /**
       * Per-seller shipment snapshot. Each entry carries sellerId, originCity,
       * originProvince, courierCode, serviceCode, weightGrams, cost, and the
       * productIds and quantities the weight was derived from.
       */
      shipments: Prisma.JsonValue
      /**
       * Sum of the per-seller costs. This is the only figure checkout may charge.
       */
      totalCost: Prisma.Decimal
      /**
       * Fingerprint of the cart the quote was computed for. Checkout recomputes it
       * and refuses the quote when it no longer matches.
       */
      cartHash: string
      status: string
      expiresAt: Date
      consumedAt: Date | null
      consumedBy: string | null
      createdAt: Date
    }, ExtArgs["result"]["shippingQuote"]>
    composites: {}
  }

  type ShippingQuoteGetPayload<S extends boolean | null | undefined | ShippingQuoteDefaultArgs> = $Result.GetResult<Prisma.$ShippingQuotePayload, S>

  type ShippingQuoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShippingQuoteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShippingQuoteCountAggregateInputType | true
    }

  export interface ShippingQuoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShippingQuote'], meta: { name: 'ShippingQuote' } }
    /**
     * Find zero or one ShippingQuote that matches the filter.
     * @param {ShippingQuoteFindUniqueArgs} args - Arguments to find a ShippingQuote
     * @example
     * // Get one ShippingQuote
     * const shippingQuote = await prisma.shippingQuote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShippingQuoteFindUniqueArgs>(args: SelectSubset<T, ShippingQuoteFindUniqueArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ShippingQuote that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ShippingQuoteFindUniqueOrThrowArgs} args - Arguments to find a ShippingQuote
     * @example
     * // Get one ShippingQuote
     * const shippingQuote = await prisma.shippingQuote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShippingQuoteFindUniqueOrThrowArgs>(args: SelectSubset<T, ShippingQuoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ShippingQuote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteFindFirstArgs} args - Arguments to find a ShippingQuote
     * @example
     * // Get one ShippingQuote
     * const shippingQuote = await prisma.shippingQuote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShippingQuoteFindFirstArgs>(args?: SelectSubset<T, ShippingQuoteFindFirstArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ShippingQuote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteFindFirstOrThrowArgs} args - Arguments to find a ShippingQuote
     * @example
     * // Get one ShippingQuote
     * const shippingQuote = await prisma.shippingQuote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShippingQuoteFindFirstOrThrowArgs>(args?: SelectSubset<T, ShippingQuoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ShippingQuotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShippingQuotes
     * const shippingQuotes = await prisma.shippingQuote.findMany()
     * 
     * // Get first 10 ShippingQuotes
     * const shippingQuotes = await prisma.shippingQuote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shippingQuoteWithIdOnly = await prisma.shippingQuote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShippingQuoteFindManyArgs>(args?: SelectSubset<T, ShippingQuoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ShippingQuote.
     * @param {ShippingQuoteCreateArgs} args - Arguments to create a ShippingQuote.
     * @example
     * // Create one ShippingQuote
     * const ShippingQuote = await prisma.shippingQuote.create({
     *   data: {
     *     // ... data to create a ShippingQuote
     *   }
     * })
     * 
     */
    create<T extends ShippingQuoteCreateArgs>(args: SelectSubset<T, ShippingQuoteCreateArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ShippingQuotes.
     * @param {ShippingQuoteCreateManyArgs} args - Arguments to create many ShippingQuotes.
     * @example
     * // Create many ShippingQuotes
     * const shippingQuote = await prisma.shippingQuote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShippingQuoteCreateManyArgs>(args?: SelectSubset<T, ShippingQuoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShippingQuotes and returns the data saved in the database.
     * @param {ShippingQuoteCreateManyAndReturnArgs} args - Arguments to create many ShippingQuotes.
     * @example
     * // Create many ShippingQuotes
     * const shippingQuote = await prisma.shippingQuote.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShippingQuotes and only return the `id`
     * const shippingQuoteWithIdOnly = await prisma.shippingQuote.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShippingQuoteCreateManyAndReturnArgs>(args?: SelectSubset<T, ShippingQuoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ShippingQuote.
     * @param {ShippingQuoteDeleteArgs} args - Arguments to delete one ShippingQuote.
     * @example
     * // Delete one ShippingQuote
     * const ShippingQuote = await prisma.shippingQuote.delete({
     *   where: {
     *     // ... filter to delete one ShippingQuote
     *   }
     * })
     * 
     */
    delete<T extends ShippingQuoteDeleteArgs>(args: SelectSubset<T, ShippingQuoteDeleteArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ShippingQuote.
     * @param {ShippingQuoteUpdateArgs} args - Arguments to update one ShippingQuote.
     * @example
     * // Update one ShippingQuote
     * const shippingQuote = await prisma.shippingQuote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShippingQuoteUpdateArgs>(args: SelectSubset<T, ShippingQuoteUpdateArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ShippingQuotes.
     * @param {ShippingQuoteDeleteManyArgs} args - Arguments to filter ShippingQuotes to delete.
     * @example
     * // Delete a few ShippingQuotes
     * const { count } = await prisma.shippingQuote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShippingQuoteDeleteManyArgs>(args?: SelectSubset<T, ShippingQuoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShippingQuotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShippingQuotes
     * const shippingQuote = await prisma.shippingQuote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShippingQuoteUpdateManyArgs>(args: SelectSubset<T, ShippingQuoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ShippingQuote.
     * @param {ShippingQuoteUpsertArgs} args - Arguments to update or create a ShippingQuote.
     * @example
     * // Update or create a ShippingQuote
     * const shippingQuote = await prisma.shippingQuote.upsert({
     *   create: {
     *     // ... data to create a ShippingQuote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShippingQuote we want to update
     *   }
     * })
     */
    upsert<T extends ShippingQuoteUpsertArgs>(args: SelectSubset<T, ShippingQuoteUpsertArgs<ExtArgs>>): Prisma__ShippingQuoteClient<$Result.GetResult<Prisma.$ShippingQuotePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ShippingQuotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteCountArgs} args - Arguments to filter ShippingQuotes to count.
     * @example
     * // Count the number of ShippingQuotes
     * const count = await prisma.shippingQuote.count({
     *   where: {
     *     // ... the filter for the ShippingQuotes we want to count
     *   }
     * })
    **/
    count<T extends ShippingQuoteCountArgs>(
      args?: Subset<T, ShippingQuoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShippingQuoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShippingQuote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShippingQuoteAggregateArgs>(args: Subset<T, ShippingQuoteAggregateArgs>): Prisma.PrismaPromise<GetShippingQuoteAggregateType<T>>

    /**
     * Group by ShippingQuote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShippingQuoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShippingQuoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShippingQuoteGroupByArgs['orderBy'] }
        : { orderBy?: ShippingQuoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShippingQuoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShippingQuoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShippingQuote model
   */
  readonly fields: ShippingQuoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShippingQuote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShippingQuoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShippingQuote model
   */ 
  interface ShippingQuoteFieldRefs {
    readonly id: FieldRef<"ShippingQuote", 'String'>
    readonly customerId: FieldRef<"ShippingQuote", 'String'>
    readonly destination: FieldRef<"ShippingQuote", 'Json'>
    readonly shipments: FieldRef<"ShippingQuote", 'Json'>
    readonly totalCost: FieldRef<"ShippingQuote", 'Decimal'>
    readonly cartHash: FieldRef<"ShippingQuote", 'String'>
    readonly status: FieldRef<"ShippingQuote", 'String'>
    readonly expiresAt: FieldRef<"ShippingQuote", 'DateTime'>
    readonly consumedAt: FieldRef<"ShippingQuote", 'DateTime'>
    readonly consumedBy: FieldRef<"ShippingQuote", 'String'>
    readonly createdAt: FieldRef<"ShippingQuote", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShippingQuote findUnique
   */
  export type ShippingQuoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * Filter, which ShippingQuote to fetch.
     */
    where: ShippingQuoteWhereUniqueInput
  }

  /**
   * ShippingQuote findUniqueOrThrow
   */
  export type ShippingQuoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * Filter, which ShippingQuote to fetch.
     */
    where: ShippingQuoteWhereUniqueInput
  }

  /**
   * ShippingQuote findFirst
   */
  export type ShippingQuoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * Filter, which ShippingQuote to fetch.
     */
    where?: ShippingQuoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingQuotes to fetch.
     */
    orderBy?: ShippingQuoteOrderByWithRelationInput | ShippingQuoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingQuotes.
     */
    cursor?: ShippingQuoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingQuotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingQuotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingQuotes.
     */
    distinct?: ShippingQuoteScalarFieldEnum | ShippingQuoteScalarFieldEnum[]
  }

  /**
   * ShippingQuote findFirstOrThrow
   */
  export type ShippingQuoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * Filter, which ShippingQuote to fetch.
     */
    where?: ShippingQuoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingQuotes to fetch.
     */
    orderBy?: ShippingQuoteOrderByWithRelationInput | ShippingQuoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShippingQuotes.
     */
    cursor?: ShippingQuoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingQuotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingQuotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShippingQuotes.
     */
    distinct?: ShippingQuoteScalarFieldEnum | ShippingQuoteScalarFieldEnum[]
  }

  /**
   * ShippingQuote findMany
   */
  export type ShippingQuoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * Filter, which ShippingQuotes to fetch.
     */
    where?: ShippingQuoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShippingQuotes to fetch.
     */
    orderBy?: ShippingQuoteOrderByWithRelationInput | ShippingQuoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShippingQuotes.
     */
    cursor?: ShippingQuoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShippingQuotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShippingQuotes.
     */
    skip?: number
    distinct?: ShippingQuoteScalarFieldEnum | ShippingQuoteScalarFieldEnum[]
  }

  /**
   * ShippingQuote create
   */
  export type ShippingQuoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * The data needed to create a ShippingQuote.
     */
    data: XOR<ShippingQuoteCreateInput, ShippingQuoteUncheckedCreateInput>
  }

  /**
   * ShippingQuote createMany
   */
  export type ShippingQuoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShippingQuotes.
     */
    data: ShippingQuoteCreateManyInput | ShippingQuoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShippingQuote createManyAndReturn
   */
  export type ShippingQuoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ShippingQuotes.
     */
    data: ShippingQuoteCreateManyInput | ShippingQuoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShippingQuote update
   */
  export type ShippingQuoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * The data needed to update a ShippingQuote.
     */
    data: XOR<ShippingQuoteUpdateInput, ShippingQuoteUncheckedUpdateInput>
    /**
     * Choose, which ShippingQuote to update.
     */
    where: ShippingQuoteWhereUniqueInput
  }

  /**
   * ShippingQuote updateMany
   */
  export type ShippingQuoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShippingQuotes.
     */
    data: XOR<ShippingQuoteUpdateManyMutationInput, ShippingQuoteUncheckedUpdateManyInput>
    /**
     * Filter which ShippingQuotes to update
     */
    where?: ShippingQuoteWhereInput
  }

  /**
   * ShippingQuote upsert
   */
  export type ShippingQuoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * The filter to search for the ShippingQuote to update in case it exists.
     */
    where: ShippingQuoteWhereUniqueInput
    /**
     * In case the ShippingQuote found by the `where` argument doesn't exist, create a new ShippingQuote with this data.
     */
    create: XOR<ShippingQuoteCreateInput, ShippingQuoteUncheckedCreateInput>
    /**
     * In case the ShippingQuote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShippingQuoteUpdateInput, ShippingQuoteUncheckedUpdateInput>
  }

  /**
   * ShippingQuote delete
   */
  export type ShippingQuoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
    /**
     * Filter which ShippingQuote to delete.
     */
    where: ShippingQuoteWhereUniqueInput
  }

  /**
   * ShippingQuote deleteMany
   */
  export type ShippingQuoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShippingQuotes to delete
     */
    where?: ShippingQuoteWhereInput
  }

  /**
   * ShippingQuote without action
   */
  export type ShippingQuoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShippingQuote
     */
    select?: ShippingQuoteSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CourierScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    services: 'services',
    isActive: 'isActive',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CourierScalarFieldEnum = (typeof CourierScalarFieldEnum)[keyof typeof CourierScalarFieldEnum]


  export const ShippingRateScalarFieldEnum: {
    id: 'id',
    courierId: 'courierId',
    originCity: 'originCity',
    destinationCity: 'destinationCity',
    serviceCode: 'serviceCode',
    weight: 'weight',
    cost: 'cost',
    estimatedDays: 'estimatedDays',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ShippingRateScalarFieldEnum = (typeof ShippingRateScalarFieldEnum)[keyof typeof ShippingRateScalarFieldEnum]


  export const ShippingOrderScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    sellerId: 'sellerId',
    courierId: 'courierId',
    courierName: 'courierName',
    serviceCode: 'serviceCode',
    serviceName: 'serviceName',
    trackingNumber: 'trackingNumber',
    originAddress: 'originAddress',
    destinationAddress: 'destinationAddress',
    weight: 'weight',
    cost: 'cost',
    status: 'status',
    estimatedDelivery: 'estimatedDelivery',
    notes: 'notes',
    shippedAt: 'shippedAt',
    deliveredAt: 'deliveredAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ShippingOrderScalarFieldEnum = (typeof ShippingOrderScalarFieldEnum)[keyof typeof ShippingOrderScalarFieldEnum]


  export const ShippingStatusHistoryScalarFieldEnum: {
    id: 'id',
    shippingOrderId: 'shippingOrderId',
    fromStatus: 'fromStatus',
    toStatus: 'toStatus',
    location: 'location',
    note: 'note',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt'
  };

  export type ShippingStatusHistoryScalarFieldEnum = (typeof ShippingStatusHistoryScalarFieldEnum)[keyof typeof ShippingStatusHistoryScalarFieldEnum]


  export const OutboxEventScalarFieldEnum: {
    id: 'id',
    aggregateType: 'aggregateType',
    aggregateId: 'aggregateId',
    eventName: 'eventName',
    routingKey: 'routingKey',
    eventPayload: 'eventPayload',
    status: 'status',
    attempts: 'attempts',
    availableAt: 'availableAt',
    lockedAt: 'lockedAt',
    lockToken: 'lockToken',
    publishedAt: 'publishedAt',
    lastError: 'lastError',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OutboxEventScalarFieldEnum = (typeof OutboxEventScalarFieldEnum)[keyof typeof OutboxEventScalarFieldEnum]


  export const ShippingQuoteScalarFieldEnum: {
    id: 'id',
    customerId: 'customerId',
    destination: 'destination',
    shipments: 'shipments',
    totalCost: 'totalCost',
    cartHash: 'cartHash',
    status: 'status',
    expiresAt: 'expiresAt',
    consumedAt: 'consumedAt',
    consumedBy: 'consumedBy',
    createdAt: 'createdAt'
  };

  export type ShippingQuoteScalarFieldEnum = (typeof ShippingQuoteScalarFieldEnum)[keyof typeof ShippingQuoteScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CourierWhereInput = {
    AND?: CourierWhereInput | CourierWhereInput[]
    OR?: CourierWhereInput[]
    NOT?: CourierWhereInput | CourierWhereInput[]
    id?: StringFilter<"Courier"> | string
    name?: StringFilter<"Courier"> | string
    code?: StringFilter<"Courier"> | string
    services?: JsonFilter<"Courier">
    isActive?: BoolFilter<"Courier"> | boolean
    createdBy?: StringNullableFilter<"Courier"> | string | null
    updatedBy?: StringNullableFilter<"Courier"> | string | null
    createdAt?: DateTimeFilter<"Courier"> | Date | string
    updatedAt?: DateTimeFilter<"Courier"> | Date | string
    rates?: ShippingRateListRelationFilter
    orders?: ShippingOrderListRelationFilter
  }

  export type CourierOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    services?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rates?: ShippingRateOrderByRelationAggregateInput
    orders?: ShippingOrderOrderByRelationAggregateInput
  }

  export type CourierWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    code?: string
    AND?: CourierWhereInput | CourierWhereInput[]
    OR?: CourierWhereInput[]
    NOT?: CourierWhereInput | CourierWhereInput[]
    services?: JsonFilter<"Courier">
    isActive?: BoolFilter<"Courier"> | boolean
    createdBy?: StringNullableFilter<"Courier"> | string | null
    updatedBy?: StringNullableFilter<"Courier"> | string | null
    createdAt?: DateTimeFilter<"Courier"> | Date | string
    updatedAt?: DateTimeFilter<"Courier"> | Date | string
    rates?: ShippingRateListRelationFilter
    orders?: ShippingOrderListRelationFilter
  }, "id" | "name" | "code">

  export type CourierOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    services?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CourierCountOrderByAggregateInput
    _max?: CourierMaxOrderByAggregateInput
    _min?: CourierMinOrderByAggregateInput
  }

  export type CourierScalarWhereWithAggregatesInput = {
    AND?: CourierScalarWhereWithAggregatesInput | CourierScalarWhereWithAggregatesInput[]
    OR?: CourierScalarWhereWithAggregatesInput[]
    NOT?: CourierScalarWhereWithAggregatesInput | CourierScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Courier"> | string
    name?: StringWithAggregatesFilter<"Courier"> | string
    code?: StringWithAggregatesFilter<"Courier"> | string
    services?: JsonWithAggregatesFilter<"Courier">
    isActive?: BoolWithAggregatesFilter<"Courier"> | boolean
    createdBy?: StringNullableWithAggregatesFilter<"Courier"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"Courier"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Courier"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Courier"> | Date | string
  }

  export type ShippingRateWhereInput = {
    AND?: ShippingRateWhereInput | ShippingRateWhereInput[]
    OR?: ShippingRateWhereInput[]
    NOT?: ShippingRateWhereInput | ShippingRateWhereInput[]
    id?: StringFilter<"ShippingRate"> | string
    courierId?: StringFilter<"ShippingRate"> | string
    originCity?: StringFilter<"ShippingRate"> | string
    destinationCity?: StringFilter<"ShippingRate"> | string
    serviceCode?: StringFilter<"ShippingRate"> | string
    weight?: IntFilter<"ShippingRate"> | number
    cost?: DecimalFilter<"ShippingRate"> | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFilter<"ShippingRate"> | string
    createdBy?: StringNullableFilter<"ShippingRate"> | string | null
    updatedBy?: StringNullableFilter<"ShippingRate"> | string | null
    createdAt?: DateTimeFilter<"ShippingRate"> | Date | string
    updatedAt?: DateTimeFilter<"ShippingRate"> | Date | string
    courier?: XOR<CourierRelationFilter, CourierWhereInput>
  }

  export type ShippingRateOrderByWithRelationInput = {
    id?: SortOrder
    courierId?: SortOrder
    originCity?: SortOrder
    destinationCity?: SortOrder
    serviceCode?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    estimatedDays?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    courier?: CourierOrderByWithRelationInput
  }

  export type ShippingRateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    courierId_originCity_destinationCity_serviceCode_weight?: ShippingRateCourierIdOriginCityDestinationCityServiceCodeWeightCompoundUniqueInput
    AND?: ShippingRateWhereInput | ShippingRateWhereInput[]
    OR?: ShippingRateWhereInput[]
    NOT?: ShippingRateWhereInput | ShippingRateWhereInput[]
    courierId?: StringFilter<"ShippingRate"> | string
    originCity?: StringFilter<"ShippingRate"> | string
    destinationCity?: StringFilter<"ShippingRate"> | string
    serviceCode?: StringFilter<"ShippingRate"> | string
    weight?: IntFilter<"ShippingRate"> | number
    cost?: DecimalFilter<"ShippingRate"> | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFilter<"ShippingRate"> | string
    createdBy?: StringNullableFilter<"ShippingRate"> | string | null
    updatedBy?: StringNullableFilter<"ShippingRate"> | string | null
    createdAt?: DateTimeFilter<"ShippingRate"> | Date | string
    updatedAt?: DateTimeFilter<"ShippingRate"> | Date | string
    courier?: XOR<CourierRelationFilter, CourierWhereInput>
  }, "id" | "courierId_originCity_destinationCity_serviceCode_weight">

  export type ShippingRateOrderByWithAggregationInput = {
    id?: SortOrder
    courierId?: SortOrder
    originCity?: SortOrder
    destinationCity?: SortOrder
    serviceCode?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    estimatedDays?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ShippingRateCountOrderByAggregateInput
    _avg?: ShippingRateAvgOrderByAggregateInput
    _max?: ShippingRateMaxOrderByAggregateInput
    _min?: ShippingRateMinOrderByAggregateInput
    _sum?: ShippingRateSumOrderByAggregateInput
  }

  export type ShippingRateScalarWhereWithAggregatesInput = {
    AND?: ShippingRateScalarWhereWithAggregatesInput | ShippingRateScalarWhereWithAggregatesInput[]
    OR?: ShippingRateScalarWhereWithAggregatesInput[]
    NOT?: ShippingRateScalarWhereWithAggregatesInput | ShippingRateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ShippingRate"> | string
    courierId?: StringWithAggregatesFilter<"ShippingRate"> | string
    originCity?: StringWithAggregatesFilter<"ShippingRate"> | string
    destinationCity?: StringWithAggregatesFilter<"ShippingRate"> | string
    serviceCode?: StringWithAggregatesFilter<"ShippingRate"> | string
    weight?: IntWithAggregatesFilter<"ShippingRate"> | number
    cost?: DecimalWithAggregatesFilter<"ShippingRate"> | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringWithAggregatesFilter<"ShippingRate"> | string
    createdBy?: StringNullableWithAggregatesFilter<"ShippingRate"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"ShippingRate"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ShippingRate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ShippingRate"> | Date | string
  }

  export type ShippingOrderWhereInput = {
    AND?: ShippingOrderWhereInput | ShippingOrderWhereInput[]
    OR?: ShippingOrderWhereInput[]
    NOT?: ShippingOrderWhereInput | ShippingOrderWhereInput[]
    id?: StringFilter<"ShippingOrder"> | string
    orderId?: StringFilter<"ShippingOrder"> | string
    sellerId?: StringNullableFilter<"ShippingOrder"> | string | null
    courierId?: StringFilter<"ShippingOrder"> | string
    courierName?: StringFilter<"ShippingOrder"> | string
    serviceCode?: StringFilter<"ShippingOrder"> | string
    serviceName?: StringFilter<"ShippingOrder"> | string
    trackingNumber?: StringNullableFilter<"ShippingOrder"> | string | null
    originAddress?: JsonFilter<"ShippingOrder">
    destinationAddress?: JsonFilter<"ShippingOrder">
    weight?: IntFilter<"ShippingOrder"> | number
    cost?: DecimalFilter<"ShippingOrder"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"ShippingOrder"> | string
    estimatedDelivery?: StringNullableFilter<"ShippingOrder"> | string | null
    notes?: StringNullableFilter<"ShippingOrder"> | string | null
    shippedAt?: DateTimeNullableFilter<"ShippingOrder"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"ShippingOrder"> | Date | string | null
    createdAt?: DateTimeFilter<"ShippingOrder"> | Date | string
    updatedAt?: DateTimeFilter<"ShippingOrder"> | Date | string
    courier?: XOR<CourierRelationFilter, CourierWhereInput>
    history?: ShippingStatusHistoryListRelationFilter
  }

  export type ShippingOrderOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    sellerId?: SortOrderInput | SortOrder
    courierId?: SortOrder
    courierName?: SortOrder
    serviceCode?: SortOrder
    serviceName?: SortOrder
    trackingNumber?: SortOrderInput | SortOrder
    originAddress?: SortOrder
    destinationAddress?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    status?: SortOrder
    estimatedDelivery?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    shippedAt?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    courier?: CourierOrderByWithRelationInput
    history?: ShippingStatusHistoryOrderByRelationAggregateInput
  }

  export type ShippingOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    trackingNumber?: string
    orderId_sellerId?: ShippingOrderOrderIdSellerIdCompoundUniqueInput
    AND?: ShippingOrderWhereInput | ShippingOrderWhereInput[]
    OR?: ShippingOrderWhereInput[]
    NOT?: ShippingOrderWhereInput | ShippingOrderWhereInput[]
    orderId?: StringFilter<"ShippingOrder"> | string
    sellerId?: StringNullableFilter<"ShippingOrder"> | string | null
    courierId?: StringFilter<"ShippingOrder"> | string
    courierName?: StringFilter<"ShippingOrder"> | string
    serviceCode?: StringFilter<"ShippingOrder"> | string
    serviceName?: StringFilter<"ShippingOrder"> | string
    originAddress?: JsonFilter<"ShippingOrder">
    destinationAddress?: JsonFilter<"ShippingOrder">
    weight?: IntFilter<"ShippingOrder"> | number
    cost?: DecimalFilter<"ShippingOrder"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"ShippingOrder"> | string
    estimatedDelivery?: StringNullableFilter<"ShippingOrder"> | string | null
    notes?: StringNullableFilter<"ShippingOrder"> | string | null
    shippedAt?: DateTimeNullableFilter<"ShippingOrder"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"ShippingOrder"> | Date | string | null
    createdAt?: DateTimeFilter<"ShippingOrder"> | Date | string
    updatedAt?: DateTimeFilter<"ShippingOrder"> | Date | string
    courier?: XOR<CourierRelationFilter, CourierWhereInput>
    history?: ShippingStatusHistoryListRelationFilter
  }, "id" | "trackingNumber" | "orderId_sellerId">

  export type ShippingOrderOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    sellerId?: SortOrderInput | SortOrder
    courierId?: SortOrder
    courierName?: SortOrder
    serviceCode?: SortOrder
    serviceName?: SortOrder
    trackingNumber?: SortOrderInput | SortOrder
    originAddress?: SortOrder
    destinationAddress?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    status?: SortOrder
    estimatedDelivery?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    shippedAt?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ShippingOrderCountOrderByAggregateInput
    _avg?: ShippingOrderAvgOrderByAggregateInput
    _max?: ShippingOrderMaxOrderByAggregateInput
    _min?: ShippingOrderMinOrderByAggregateInput
    _sum?: ShippingOrderSumOrderByAggregateInput
  }

  export type ShippingOrderScalarWhereWithAggregatesInput = {
    AND?: ShippingOrderScalarWhereWithAggregatesInput | ShippingOrderScalarWhereWithAggregatesInput[]
    OR?: ShippingOrderScalarWhereWithAggregatesInput[]
    NOT?: ShippingOrderScalarWhereWithAggregatesInput | ShippingOrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ShippingOrder"> | string
    orderId?: StringWithAggregatesFilter<"ShippingOrder"> | string
    sellerId?: StringNullableWithAggregatesFilter<"ShippingOrder"> | string | null
    courierId?: StringWithAggregatesFilter<"ShippingOrder"> | string
    courierName?: StringWithAggregatesFilter<"ShippingOrder"> | string
    serviceCode?: StringWithAggregatesFilter<"ShippingOrder"> | string
    serviceName?: StringWithAggregatesFilter<"ShippingOrder"> | string
    trackingNumber?: StringNullableWithAggregatesFilter<"ShippingOrder"> | string | null
    originAddress?: JsonWithAggregatesFilter<"ShippingOrder">
    destinationAddress?: JsonWithAggregatesFilter<"ShippingOrder">
    weight?: IntWithAggregatesFilter<"ShippingOrder"> | number
    cost?: DecimalWithAggregatesFilter<"ShippingOrder"> | Decimal | DecimalJsLike | number | string
    status?: StringWithAggregatesFilter<"ShippingOrder"> | string
    estimatedDelivery?: StringNullableWithAggregatesFilter<"ShippingOrder"> | string | null
    notes?: StringNullableWithAggregatesFilter<"ShippingOrder"> | string | null
    shippedAt?: DateTimeNullableWithAggregatesFilter<"ShippingOrder"> | Date | string | null
    deliveredAt?: DateTimeNullableWithAggregatesFilter<"ShippingOrder"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ShippingOrder"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ShippingOrder"> | Date | string
  }

  export type ShippingStatusHistoryWhereInput = {
    AND?: ShippingStatusHistoryWhereInput | ShippingStatusHistoryWhereInput[]
    OR?: ShippingStatusHistoryWhereInput[]
    NOT?: ShippingStatusHistoryWhereInput | ShippingStatusHistoryWhereInput[]
    id?: StringFilter<"ShippingStatusHistory"> | string
    shippingOrderId?: StringFilter<"ShippingStatusHistory"> | string
    fromStatus?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    toStatus?: StringFilter<"ShippingStatusHistory"> | string
    location?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    note?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    updatedBy?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    createdAt?: DateTimeFilter<"ShippingStatusHistory"> | Date | string
    shippingOrder?: XOR<ShippingOrderRelationFilter, ShippingOrderWhereInput>
  }

  export type ShippingStatusHistoryOrderByWithRelationInput = {
    id?: SortOrder
    shippingOrderId?: SortOrder
    fromStatus?: SortOrderInput | SortOrder
    toStatus?: SortOrder
    location?: SortOrderInput | SortOrder
    note?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    shippingOrder?: ShippingOrderOrderByWithRelationInput
  }

  export type ShippingStatusHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShippingStatusHistoryWhereInput | ShippingStatusHistoryWhereInput[]
    OR?: ShippingStatusHistoryWhereInput[]
    NOT?: ShippingStatusHistoryWhereInput | ShippingStatusHistoryWhereInput[]
    shippingOrderId?: StringFilter<"ShippingStatusHistory"> | string
    fromStatus?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    toStatus?: StringFilter<"ShippingStatusHistory"> | string
    location?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    note?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    updatedBy?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    createdAt?: DateTimeFilter<"ShippingStatusHistory"> | Date | string
    shippingOrder?: XOR<ShippingOrderRelationFilter, ShippingOrderWhereInput>
  }, "id">

  export type ShippingStatusHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    shippingOrderId?: SortOrder
    fromStatus?: SortOrderInput | SortOrder
    toStatus?: SortOrder
    location?: SortOrderInput | SortOrder
    note?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ShippingStatusHistoryCountOrderByAggregateInput
    _max?: ShippingStatusHistoryMaxOrderByAggregateInput
    _min?: ShippingStatusHistoryMinOrderByAggregateInput
  }

  export type ShippingStatusHistoryScalarWhereWithAggregatesInput = {
    AND?: ShippingStatusHistoryScalarWhereWithAggregatesInput | ShippingStatusHistoryScalarWhereWithAggregatesInput[]
    OR?: ShippingStatusHistoryScalarWhereWithAggregatesInput[]
    NOT?: ShippingStatusHistoryScalarWhereWithAggregatesInput | ShippingStatusHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ShippingStatusHistory"> | string
    shippingOrderId?: StringWithAggregatesFilter<"ShippingStatusHistory"> | string
    fromStatus?: StringNullableWithAggregatesFilter<"ShippingStatusHistory"> | string | null
    toStatus?: StringWithAggregatesFilter<"ShippingStatusHistory"> | string
    location?: StringNullableWithAggregatesFilter<"ShippingStatusHistory"> | string | null
    note?: StringNullableWithAggregatesFilter<"ShippingStatusHistory"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"ShippingStatusHistory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ShippingStatusHistory"> | Date | string
  }

  export type OutboxEventWhereInput = {
    AND?: OutboxEventWhereInput | OutboxEventWhereInput[]
    OR?: OutboxEventWhereInput[]
    NOT?: OutboxEventWhereInput | OutboxEventWhereInput[]
    id?: StringFilter<"OutboxEvent"> | string
    aggregateType?: StringFilter<"OutboxEvent"> | string
    aggregateId?: StringFilter<"OutboxEvent"> | string
    eventName?: StringFilter<"OutboxEvent"> | string
    routingKey?: StringFilter<"OutboxEvent"> | string
    eventPayload?: JsonFilter<"OutboxEvent">
    status?: StringFilter<"OutboxEvent"> | string
    attempts?: IntFilter<"OutboxEvent"> | number
    availableAt?: DateTimeFilter<"OutboxEvent"> | Date | string
    lockedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lockToken?: StringNullableFilter<"OutboxEvent"> | string | null
    publishedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lastError?: StringNullableFilter<"OutboxEvent"> | string | null
    createdAt?: DateTimeFilter<"OutboxEvent"> | Date | string
    updatedAt?: DateTimeFilter<"OutboxEvent"> | Date | string
  }

  export type OutboxEventOrderByWithRelationInput = {
    id?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventName?: SortOrder
    routingKey?: SortOrder
    eventPayload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    availableAt?: SortOrder
    lockedAt?: SortOrderInput | SortOrder
    lockToken?: SortOrderInput | SortOrder
    publishedAt?: SortOrderInput | SortOrder
    lastError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutboxEventWhereInput | OutboxEventWhereInput[]
    OR?: OutboxEventWhereInput[]
    NOT?: OutboxEventWhereInput | OutboxEventWhereInput[]
    aggregateType?: StringFilter<"OutboxEvent"> | string
    aggregateId?: StringFilter<"OutboxEvent"> | string
    eventName?: StringFilter<"OutboxEvent"> | string
    routingKey?: StringFilter<"OutboxEvent"> | string
    eventPayload?: JsonFilter<"OutboxEvent">
    status?: StringFilter<"OutboxEvent"> | string
    attempts?: IntFilter<"OutboxEvent"> | number
    availableAt?: DateTimeFilter<"OutboxEvent"> | Date | string
    lockedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lockToken?: StringNullableFilter<"OutboxEvent"> | string | null
    publishedAt?: DateTimeNullableFilter<"OutboxEvent"> | Date | string | null
    lastError?: StringNullableFilter<"OutboxEvent"> | string | null
    createdAt?: DateTimeFilter<"OutboxEvent"> | Date | string
    updatedAt?: DateTimeFilter<"OutboxEvent"> | Date | string
  }, "id">

  export type OutboxEventOrderByWithAggregationInput = {
    id?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventName?: SortOrder
    routingKey?: SortOrder
    eventPayload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    availableAt?: SortOrder
    lockedAt?: SortOrderInput | SortOrder
    lockToken?: SortOrderInput | SortOrder
    publishedAt?: SortOrderInput | SortOrder
    lastError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OutboxEventCountOrderByAggregateInput
    _avg?: OutboxEventAvgOrderByAggregateInput
    _max?: OutboxEventMaxOrderByAggregateInput
    _min?: OutboxEventMinOrderByAggregateInput
    _sum?: OutboxEventSumOrderByAggregateInput
  }

  export type OutboxEventScalarWhereWithAggregatesInput = {
    AND?: OutboxEventScalarWhereWithAggregatesInput | OutboxEventScalarWhereWithAggregatesInput[]
    OR?: OutboxEventScalarWhereWithAggregatesInput[]
    NOT?: OutboxEventScalarWhereWithAggregatesInput | OutboxEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OutboxEvent"> | string
    aggregateType?: StringWithAggregatesFilter<"OutboxEvent"> | string
    aggregateId?: StringWithAggregatesFilter<"OutboxEvent"> | string
    eventName?: StringWithAggregatesFilter<"OutboxEvent"> | string
    routingKey?: StringWithAggregatesFilter<"OutboxEvent"> | string
    eventPayload?: JsonWithAggregatesFilter<"OutboxEvent">
    status?: StringWithAggregatesFilter<"OutboxEvent"> | string
    attempts?: IntWithAggregatesFilter<"OutboxEvent"> | number
    availableAt?: DateTimeWithAggregatesFilter<"OutboxEvent"> | Date | string
    lockedAt?: DateTimeNullableWithAggregatesFilter<"OutboxEvent"> | Date | string | null
    lockToken?: StringNullableWithAggregatesFilter<"OutboxEvent"> | string | null
    publishedAt?: DateTimeNullableWithAggregatesFilter<"OutboxEvent"> | Date | string | null
    lastError?: StringNullableWithAggregatesFilter<"OutboxEvent"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OutboxEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OutboxEvent"> | Date | string
  }

  export type ShippingQuoteWhereInput = {
    AND?: ShippingQuoteWhereInput | ShippingQuoteWhereInput[]
    OR?: ShippingQuoteWhereInput[]
    NOT?: ShippingQuoteWhereInput | ShippingQuoteWhereInput[]
    id?: StringFilter<"ShippingQuote"> | string
    customerId?: StringFilter<"ShippingQuote"> | string
    destination?: JsonFilter<"ShippingQuote">
    shipments?: JsonFilter<"ShippingQuote">
    totalCost?: DecimalFilter<"ShippingQuote"> | Decimal | DecimalJsLike | number | string
    cartHash?: StringFilter<"ShippingQuote"> | string
    status?: StringFilter<"ShippingQuote"> | string
    expiresAt?: DateTimeFilter<"ShippingQuote"> | Date | string
    consumedAt?: DateTimeNullableFilter<"ShippingQuote"> | Date | string | null
    consumedBy?: StringNullableFilter<"ShippingQuote"> | string | null
    createdAt?: DateTimeFilter<"ShippingQuote"> | Date | string
  }

  export type ShippingQuoteOrderByWithRelationInput = {
    id?: SortOrder
    customerId?: SortOrder
    destination?: SortOrder
    shipments?: SortOrder
    totalCost?: SortOrder
    cartHash?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrderInput | SortOrder
    consumedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type ShippingQuoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShippingQuoteWhereInput | ShippingQuoteWhereInput[]
    OR?: ShippingQuoteWhereInput[]
    NOT?: ShippingQuoteWhereInput | ShippingQuoteWhereInput[]
    customerId?: StringFilter<"ShippingQuote"> | string
    destination?: JsonFilter<"ShippingQuote">
    shipments?: JsonFilter<"ShippingQuote">
    totalCost?: DecimalFilter<"ShippingQuote"> | Decimal | DecimalJsLike | number | string
    cartHash?: StringFilter<"ShippingQuote"> | string
    status?: StringFilter<"ShippingQuote"> | string
    expiresAt?: DateTimeFilter<"ShippingQuote"> | Date | string
    consumedAt?: DateTimeNullableFilter<"ShippingQuote"> | Date | string | null
    consumedBy?: StringNullableFilter<"ShippingQuote"> | string | null
    createdAt?: DateTimeFilter<"ShippingQuote"> | Date | string
  }, "id">

  export type ShippingQuoteOrderByWithAggregationInput = {
    id?: SortOrder
    customerId?: SortOrder
    destination?: SortOrder
    shipments?: SortOrder
    totalCost?: SortOrder
    cartHash?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrderInput | SortOrder
    consumedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ShippingQuoteCountOrderByAggregateInput
    _avg?: ShippingQuoteAvgOrderByAggregateInput
    _max?: ShippingQuoteMaxOrderByAggregateInput
    _min?: ShippingQuoteMinOrderByAggregateInput
    _sum?: ShippingQuoteSumOrderByAggregateInput
  }

  export type ShippingQuoteScalarWhereWithAggregatesInput = {
    AND?: ShippingQuoteScalarWhereWithAggregatesInput | ShippingQuoteScalarWhereWithAggregatesInput[]
    OR?: ShippingQuoteScalarWhereWithAggregatesInput[]
    NOT?: ShippingQuoteScalarWhereWithAggregatesInput | ShippingQuoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ShippingQuote"> | string
    customerId?: StringWithAggregatesFilter<"ShippingQuote"> | string
    destination?: JsonWithAggregatesFilter<"ShippingQuote">
    shipments?: JsonWithAggregatesFilter<"ShippingQuote">
    totalCost?: DecimalWithAggregatesFilter<"ShippingQuote"> | Decimal | DecimalJsLike | number | string
    cartHash?: StringWithAggregatesFilter<"ShippingQuote"> | string
    status?: StringWithAggregatesFilter<"ShippingQuote"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"ShippingQuote"> | Date | string
    consumedAt?: DateTimeNullableWithAggregatesFilter<"ShippingQuote"> | Date | string | null
    consumedBy?: StringNullableWithAggregatesFilter<"ShippingQuote"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ShippingQuote"> | Date | string
  }

  export type CourierCreateInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    rates?: ShippingRateCreateNestedManyWithoutCourierInput
    orders?: ShippingOrderCreateNestedManyWithoutCourierInput
  }

  export type CourierUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    rates?: ShippingRateUncheckedCreateNestedManyWithoutCourierInput
    orders?: ShippingOrderUncheckedCreateNestedManyWithoutCourierInput
  }

  export type CourierUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rates?: ShippingRateUpdateManyWithoutCourierNestedInput
    orders?: ShippingOrderUpdateManyWithoutCourierNestedInput
  }

  export type CourierUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rates?: ShippingRateUncheckedUpdateManyWithoutCourierNestedInput
    orders?: ShippingOrderUncheckedUpdateManyWithoutCourierNestedInput
  }

  export type CourierCreateManyInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourierUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourierUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingRateCreateInput = {
    id?: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    estimatedDays: string
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    courier: CourierCreateNestedOneWithoutRatesInput
  }

  export type ShippingRateUncheckedCreateInput = {
    id?: string
    courierId: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    estimatedDays: string
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingRateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    courier?: CourierUpdateOneRequiredWithoutRatesNestedInput
  }

  export type ShippingRateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    courierId?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingRateCreateManyInput = {
    id?: string
    courierId: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    estimatedDays: string
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingRateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingRateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    courierId?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingOrderCreateInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    courier: CourierCreateNestedOneWithoutOrdersInput
    history?: ShippingStatusHistoryCreateNestedManyWithoutShippingOrderInput
  }

  export type ShippingOrderUncheckedCreateInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierId: string
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    history?: ShippingStatusHistoryUncheckedCreateNestedManyWithoutShippingOrderInput
  }

  export type ShippingOrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    courier?: CourierUpdateOneRequiredWithoutOrdersNestedInput
    history?: ShippingStatusHistoryUpdateManyWithoutShippingOrderNestedInput
  }

  export type ShippingOrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierId?: StringFieldUpdateOperationsInput | string
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    history?: ShippingStatusHistoryUncheckedUpdateManyWithoutShippingOrderNestedInput
  }

  export type ShippingOrderCreateManyInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierId: string
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingOrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingOrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierId?: StringFieldUpdateOperationsInput | string
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingStatusHistoryCreateInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    location?: string | null
    note?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    shippingOrder: ShippingOrderCreateNestedOneWithoutHistoryInput
  }

  export type ShippingStatusHistoryUncheckedCreateInput = {
    id?: string
    shippingOrderId: string
    fromStatus?: string | null
    toStatus: string
    location?: string | null
    note?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingStatusHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shippingOrder?: ShippingOrderUpdateOneRequiredWithoutHistoryNestedInput
  }

  export type ShippingStatusHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    shippingOrderId?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingStatusHistoryCreateManyInput = {
    id?: string
    shippingOrderId: string
    fromStatus?: string | null
    toStatus: string
    location?: string | null
    note?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingStatusHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingStatusHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    shippingOrderId?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxEventCreateInput = {
    id: string
    aggregateType: string
    aggregateId: string
    eventName: string
    routingKey: string
    eventPayload: JsonNullValueInput | InputJsonValue
    status?: string
    attempts?: number
    availableAt?: Date | string
    lockedAt?: Date | string | null
    lockToken?: string | null
    publishedAt?: Date | string | null
    lastError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutboxEventUncheckedCreateInput = {
    id: string
    aggregateType: string
    aggregateId: string
    eventName: string
    routingKey: string
    eventPayload: JsonNullValueInput | InputJsonValue
    status?: string
    attempts?: number
    availableAt?: Date | string
    lockedAt?: Date | string | null
    lockToken?: string | null
    publishedAt?: Date | string | null
    lastError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutboxEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    routingKey?: StringFieldUpdateOperationsInput | string
    eventPayload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    availableAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockToken?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    routingKey?: StringFieldUpdateOperationsInput | string
    eventPayload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    availableAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockToken?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxEventCreateManyInput = {
    id: string
    aggregateType: string
    aggregateId: string
    eventName: string
    routingKey: string
    eventPayload: JsonNullValueInput | InputJsonValue
    status?: string
    attempts?: number
    availableAt?: Date | string
    lockedAt?: Date | string | null
    lockToken?: string | null
    publishedAt?: Date | string | null
    lastError?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutboxEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    routingKey?: StringFieldUpdateOperationsInput | string
    eventPayload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    availableAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockToken?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    aggregateType?: StringFieldUpdateOperationsInput | string
    aggregateId?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    routingKey?: StringFieldUpdateOperationsInput | string
    eventPayload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    availableAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lockedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lockToken?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingQuoteCreateInput = {
    id?: string
    customerId: string
    destination: JsonNullValueInput | InputJsonValue
    shipments: JsonNullValueInput | InputJsonValue
    totalCost: Decimal | DecimalJsLike | number | string
    cartHash: string
    status?: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    consumedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingQuoteUncheckedCreateInput = {
    id?: string
    customerId: string
    destination: JsonNullValueInput | InputJsonValue
    shipments: JsonNullValueInput | InputJsonValue
    totalCost: Decimal | DecimalJsLike | number | string
    cartHash: string
    status?: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    consumedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingQuoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    destination?: JsonNullValueInput | InputJsonValue
    shipments?: JsonNullValueInput | InputJsonValue
    totalCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cartHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingQuoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    destination?: JsonNullValueInput | InputJsonValue
    shipments?: JsonNullValueInput | InputJsonValue
    totalCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cartHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingQuoteCreateManyInput = {
    id?: string
    customerId: string
    destination: JsonNullValueInput | InputJsonValue
    shipments: JsonNullValueInput | InputJsonValue
    totalCost: Decimal | DecimalJsLike | number | string
    cartHash: string
    status?: string
    expiresAt: Date | string
    consumedAt?: Date | string | null
    consumedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingQuoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    destination?: JsonNullValueInput | InputJsonValue
    shipments?: JsonNullValueInput | InputJsonValue
    totalCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cartHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingQuoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    destination?: JsonNullValueInput | InputJsonValue
    shipments?: JsonNullValueInput | InputJsonValue
    totalCost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    cartHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ShippingRateListRelationFilter = {
    every?: ShippingRateWhereInput
    some?: ShippingRateWhereInput
    none?: ShippingRateWhereInput
  }

  export type ShippingOrderListRelationFilter = {
    every?: ShippingOrderWhereInput
    some?: ShippingOrderWhereInput
    none?: ShippingOrderWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ShippingRateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShippingOrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CourierCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    services?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourierMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourierMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    isActive?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type CourierRelationFilter = {
    is?: CourierWhereInput
    isNot?: CourierWhereInput
  }

  export type ShippingRateCourierIdOriginCityDestinationCityServiceCodeWeightCompoundUniqueInput = {
    courierId: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
  }

  export type ShippingRateCountOrderByAggregateInput = {
    id?: SortOrder
    courierId?: SortOrder
    originCity?: SortOrder
    destinationCity?: SortOrder
    serviceCode?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    estimatedDays?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShippingRateAvgOrderByAggregateInput = {
    weight?: SortOrder
    cost?: SortOrder
  }

  export type ShippingRateMaxOrderByAggregateInput = {
    id?: SortOrder
    courierId?: SortOrder
    originCity?: SortOrder
    destinationCity?: SortOrder
    serviceCode?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    estimatedDays?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShippingRateMinOrderByAggregateInput = {
    id?: SortOrder
    courierId?: SortOrder
    originCity?: SortOrder
    destinationCity?: SortOrder
    serviceCode?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    estimatedDays?: SortOrder
    createdBy?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShippingRateSumOrderByAggregateInput = {
    weight?: SortOrder
    cost?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ShippingStatusHistoryListRelationFilter = {
    every?: ShippingStatusHistoryWhereInput
    some?: ShippingStatusHistoryWhereInput
    none?: ShippingStatusHistoryWhereInput
  }

  export type ShippingStatusHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShippingOrderOrderIdSellerIdCompoundUniqueInput = {
    orderId: string
    sellerId: string
  }

  export type ShippingOrderCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    sellerId?: SortOrder
    courierId?: SortOrder
    courierName?: SortOrder
    serviceCode?: SortOrder
    serviceName?: SortOrder
    trackingNumber?: SortOrder
    originAddress?: SortOrder
    destinationAddress?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    status?: SortOrder
    estimatedDelivery?: SortOrder
    notes?: SortOrder
    shippedAt?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShippingOrderAvgOrderByAggregateInput = {
    weight?: SortOrder
    cost?: SortOrder
  }

  export type ShippingOrderMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    sellerId?: SortOrder
    courierId?: SortOrder
    courierName?: SortOrder
    serviceCode?: SortOrder
    serviceName?: SortOrder
    trackingNumber?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    status?: SortOrder
    estimatedDelivery?: SortOrder
    notes?: SortOrder
    shippedAt?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShippingOrderMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    sellerId?: SortOrder
    courierId?: SortOrder
    courierName?: SortOrder
    serviceCode?: SortOrder
    serviceName?: SortOrder
    trackingNumber?: SortOrder
    weight?: SortOrder
    cost?: SortOrder
    status?: SortOrder
    estimatedDelivery?: SortOrder
    notes?: SortOrder
    shippedAt?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShippingOrderSumOrderByAggregateInput = {
    weight?: SortOrder
    cost?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ShippingOrderRelationFilter = {
    is?: ShippingOrderWhereInput
    isNot?: ShippingOrderWhereInput
  }

  export type ShippingStatusHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    shippingOrderId?: SortOrder
    fromStatus?: SortOrder
    toStatus?: SortOrder
    location?: SortOrder
    note?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type ShippingStatusHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    shippingOrderId?: SortOrder
    fromStatus?: SortOrder
    toStatus?: SortOrder
    location?: SortOrder
    note?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type ShippingStatusHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    shippingOrderId?: SortOrder
    fromStatus?: SortOrder
    toStatus?: SortOrder
    location?: SortOrder
    note?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type OutboxEventCountOrderByAggregateInput = {
    id?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventName?: SortOrder
    routingKey?: SortOrder
    eventPayload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    availableAt?: SortOrder
    lockedAt?: SortOrder
    lockToken?: SortOrder
    publishedAt?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxEventAvgOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type OutboxEventMaxOrderByAggregateInput = {
    id?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventName?: SortOrder
    routingKey?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    availableAt?: SortOrder
    lockedAt?: SortOrder
    lockToken?: SortOrder
    publishedAt?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxEventMinOrderByAggregateInput = {
    id?: SortOrder
    aggregateType?: SortOrder
    aggregateId?: SortOrder
    eventName?: SortOrder
    routingKey?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    availableAt?: SortOrder
    lockedAt?: SortOrder
    lockToken?: SortOrder
    publishedAt?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxEventSumOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type ShippingQuoteCountOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    destination?: SortOrder
    shipments?: SortOrder
    totalCost?: SortOrder
    cartHash?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    consumedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type ShippingQuoteAvgOrderByAggregateInput = {
    totalCost?: SortOrder
  }

  export type ShippingQuoteMaxOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    totalCost?: SortOrder
    cartHash?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    consumedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type ShippingQuoteMinOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    totalCost?: SortOrder
    cartHash?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    consumedAt?: SortOrder
    consumedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type ShippingQuoteSumOrderByAggregateInput = {
    totalCost?: SortOrder
  }

  export type ShippingRateCreateNestedManyWithoutCourierInput = {
    create?: XOR<ShippingRateCreateWithoutCourierInput, ShippingRateUncheckedCreateWithoutCourierInput> | ShippingRateCreateWithoutCourierInput[] | ShippingRateUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingRateCreateOrConnectWithoutCourierInput | ShippingRateCreateOrConnectWithoutCourierInput[]
    createMany?: ShippingRateCreateManyCourierInputEnvelope
    connect?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
  }

  export type ShippingOrderCreateNestedManyWithoutCourierInput = {
    create?: XOR<ShippingOrderCreateWithoutCourierInput, ShippingOrderUncheckedCreateWithoutCourierInput> | ShippingOrderCreateWithoutCourierInput[] | ShippingOrderUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingOrderCreateOrConnectWithoutCourierInput | ShippingOrderCreateOrConnectWithoutCourierInput[]
    createMany?: ShippingOrderCreateManyCourierInputEnvelope
    connect?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
  }

  export type ShippingRateUncheckedCreateNestedManyWithoutCourierInput = {
    create?: XOR<ShippingRateCreateWithoutCourierInput, ShippingRateUncheckedCreateWithoutCourierInput> | ShippingRateCreateWithoutCourierInput[] | ShippingRateUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingRateCreateOrConnectWithoutCourierInput | ShippingRateCreateOrConnectWithoutCourierInput[]
    createMany?: ShippingRateCreateManyCourierInputEnvelope
    connect?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
  }

  export type ShippingOrderUncheckedCreateNestedManyWithoutCourierInput = {
    create?: XOR<ShippingOrderCreateWithoutCourierInput, ShippingOrderUncheckedCreateWithoutCourierInput> | ShippingOrderCreateWithoutCourierInput[] | ShippingOrderUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingOrderCreateOrConnectWithoutCourierInput | ShippingOrderCreateOrConnectWithoutCourierInput[]
    createMany?: ShippingOrderCreateManyCourierInputEnvelope
    connect?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ShippingRateUpdateManyWithoutCourierNestedInput = {
    create?: XOR<ShippingRateCreateWithoutCourierInput, ShippingRateUncheckedCreateWithoutCourierInput> | ShippingRateCreateWithoutCourierInput[] | ShippingRateUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingRateCreateOrConnectWithoutCourierInput | ShippingRateCreateOrConnectWithoutCourierInput[]
    upsert?: ShippingRateUpsertWithWhereUniqueWithoutCourierInput | ShippingRateUpsertWithWhereUniqueWithoutCourierInput[]
    createMany?: ShippingRateCreateManyCourierInputEnvelope
    set?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    disconnect?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    delete?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    connect?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    update?: ShippingRateUpdateWithWhereUniqueWithoutCourierInput | ShippingRateUpdateWithWhereUniqueWithoutCourierInput[]
    updateMany?: ShippingRateUpdateManyWithWhereWithoutCourierInput | ShippingRateUpdateManyWithWhereWithoutCourierInput[]
    deleteMany?: ShippingRateScalarWhereInput | ShippingRateScalarWhereInput[]
  }

  export type ShippingOrderUpdateManyWithoutCourierNestedInput = {
    create?: XOR<ShippingOrderCreateWithoutCourierInput, ShippingOrderUncheckedCreateWithoutCourierInput> | ShippingOrderCreateWithoutCourierInput[] | ShippingOrderUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingOrderCreateOrConnectWithoutCourierInput | ShippingOrderCreateOrConnectWithoutCourierInput[]
    upsert?: ShippingOrderUpsertWithWhereUniqueWithoutCourierInput | ShippingOrderUpsertWithWhereUniqueWithoutCourierInput[]
    createMany?: ShippingOrderCreateManyCourierInputEnvelope
    set?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    disconnect?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    delete?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    connect?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    update?: ShippingOrderUpdateWithWhereUniqueWithoutCourierInput | ShippingOrderUpdateWithWhereUniqueWithoutCourierInput[]
    updateMany?: ShippingOrderUpdateManyWithWhereWithoutCourierInput | ShippingOrderUpdateManyWithWhereWithoutCourierInput[]
    deleteMany?: ShippingOrderScalarWhereInput | ShippingOrderScalarWhereInput[]
  }

  export type ShippingRateUncheckedUpdateManyWithoutCourierNestedInput = {
    create?: XOR<ShippingRateCreateWithoutCourierInput, ShippingRateUncheckedCreateWithoutCourierInput> | ShippingRateCreateWithoutCourierInput[] | ShippingRateUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingRateCreateOrConnectWithoutCourierInput | ShippingRateCreateOrConnectWithoutCourierInput[]
    upsert?: ShippingRateUpsertWithWhereUniqueWithoutCourierInput | ShippingRateUpsertWithWhereUniqueWithoutCourierInput[]
    createMany?: ShippingRateCreateManyCourierInputEnvelope
    set?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    disconnect?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    delete?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    connect?: ShippingRateWhereUniqueInput | ShippingRateWhereUniqueInput[]
    update?: ShippingRateUpdateWithWhereUniqueWithoutCourierInput | ShippingRateUpdateWithWhereUniqueWithoutCourierInput[]
    updateMany?: ShippingRateUpdateManyWithWhereWithoutCourierInput | ShippingRateUpdateManyWithWhereWithoutCourierInput[]
    deleteMany?: ShippingRateScalarWhereInput | ShippingRateScalarWhereInput[]
  }

  export type ShippingOrderUncheckedUpdateManyWithoutCourierNestedInput = {
    create?: XOR<ShippingOrderCreateWithoutCourierInput, ShippingOrderUncheckedCreateWithoutCourierInput> | ShippingOrderCreateWithoutCourierInput[] | ShippingOrderUncheckedCreateWithoutCourierInput[]
    connectOrCreate?: ShippingOrderCreateOrConnectWithoutCourierInput | ShippingOrderCreateOrConnectWithoutCourierInput[]
    upsert?: ShippingOrderUpsertWithWhereUniqueWithoutCourierInput | ShippingOrderUpsertWithWhereUniqueWithoutCourierInput[]
    createMany?: ShippingOrderCreateManyCourierInputEnvelope
    set?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    disconnect?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    delete?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    connect?: ShippingOrderWhereUniqueInput | ShippingOrderWhereUniqueInput[]
    update?: ShippingOrderUpdateWithWhereUniqueWithoutCourierInput | ShippingOrderUpdateWithWhereUniqueWithoutCourierInput[]
    updateMany?: ShippingOrderUpdateManyWithWhereWithoutCourierInput | ShippingOrderUpdateManyWithWhereWithoutCourierInput[]
    deleteMany?: ShippingOrderScalarWhereInput | ShippingOrderScalarWhereInput[]
  }

  export type CourierCreateNestedOneWithoutRatesInput = {
    create?: XOR<CourierCreateWithoutRatesInput, CourierUncheckedCreateWithoutRatesInput>
    connectOrCreate?: CourierCreateOrConnectWithoutRatesInput
    connect?: CourierWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type CourierUpdateOneRequiredWithoutRatesNestedInput = {
    create?: XOR<CourierCreateWithoutRatesInput, CourierUncheckedCreateWithoutRatesInput>
    connectOrCreate?: CourierCreateOrConnectWithoutRatesInput
    upsert?: CourierUpsertWithoutRatesInput
    connect?: CourierWhereUniqueInput
    update?: XOR<XOR<CourierUpdateToOneWithWhereWithoutRatesInput, CourierUpdateWithoutRatesInput>, CourierUncheckedUpdateWithoutRatesInput>
  }

  export type CourierCreateNestedOneWithoutOrdersInput = {
    create?: XOR<CourierCreateWithoutOrdersInput, CourierUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: CourierCreateOrConnectWithoutOrdersInput
    connect?: CourierWhereUniqueInput
  }

  export type ShippingStatusHistoryCreateNestedManyWithoutShippingOrderInput = {
    create?: XOR<ShippingStatusHistoryCreateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput> | ShippingStatusHistoryCreateWithoutShippingOrderInput[] | ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput[]
    connectOrCreate?: ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput | ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput[]
    createMany?: ShippingStatusHistoryCreateManyShippingOrderInputEnvelope
    connect?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
  }

  export type ShippingStatusHistoryUncheckedCreateNestedManyWithoutShippingOrderInput = {
    create?: XOR<ShippingStatusHistoryCreateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput> | ShippingStatusHistoryCreateWithoutShippingOrderInput[] | ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput[]
    connectOrCreate?: ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput | ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput[]
    createMany?: ShippingStatusHistoryCreateManyShippingOrderInputEnvelope
    connect?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CourierUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<CourierCreateWithoutOrdersInput, CourierUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: CourierCreateOrConnectWithoutOrdersInput
    upsert?: CourierUpsertWithoutOrdersInput
    connect?: CourierWhereUniqueInput
    update?: XOR<XOR<CourierUpdateToOneWithWhereWithoutOrdersInput, CourierUpdateWithoutOrdersInput>, CourierUncheckedUpdateWithoutOrdersInput>
  }

  export type ShippingStatusHistoryUpdateManyWithoutShippingOrderNestedInput = {
    create?: XOR<ShippingStatusHistoryCreateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput> | ShippingStatusHistoryCreateWithoutShippingOrderInput[] | ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput[]
    connectOrCreate?: ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput | ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput[]
    upsert?: ShippingStatusHistoryUpsertWithWhereUniqueWithoutShippingOrderInput | ShippingStatusHistoryUpsertWithWhereUniqueWithoutShippingOrderInput[]
    createMany?: ShippingStatusHistoryCreateManyShippingOrderInputEnvelope
    set?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    disconnect?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    delete?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    connect?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    update?: ShippingStatusHistoryUpdateWithWhereUniqueWithoutShippingOrderInput | ShippingStatusHistoryUpdateWithWhereUniqueWithoutShippingOrderInput[]
    updateMany?: ShippingStatusHistoryUpdateManyWithWhereWithoutShippingOrderInput | ShippingStatusHistoryUpdateManyWithWhereWithoutShippingOrderInput[]
    deleteMany?: ShippingStatusHistoryScalarWhereInput | ShippingStatusHistoryScalarWhereInput[]
  }

  export type ShippingStatusHistoryUncheckedUpdateManyWithoutShippingOrderNestedInput = {
    create?: XOR<ShippingStatusHistoryCreateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput> | ShippingStatusHistoryCreateWithoutShippingOrderInput[] | ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput[]
    connectOrCreate?: ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput | ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput[]
    upsert?: ShippingStatusHistoryUpsertWithWhereUniqueWithoutShippingOrderInput | ShippingStatusHistoryUpsertWithWhereUniqueWithoutShippingOrderInput[]
    createMany?: ShippingStatusHistoryCreateManyShippingOrderInputEnvelope
    set?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    disconnect?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    delete?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    connect?: ShippingStatusHistoryWhereUniqueInput | ShippingStatusHistoryWhereUniqueInput[]
    update?: ShippingStatusHistoryUpdateWithWhereUniqueWithoutShippingOrderInput | ShippingStatusHistoryUpdateWithWhereUniqueWithoutShippingOrderInput[]
    updateMany?: ShippingStatusHistoryUpdateManyWithWhereWithoutShippingOrderInput | ShippingStatusHistoryUpdateManyWithWhereWithoutShippingOrderInput[]
    deleteMany?: ShippingStatusHistoryScalarWhereInput | ShippingStatusHistoryScalarWhereInput[]
  }

  export type ShippingOrderCreateNestedOneWithoutHistoryInput = {
    create?: XOR<ShippingOrderCreateWithoutHistoryInput, ShippingOrderUncheckedCreateWithoutHistoryInput>
    connectOrCreate?: ShippingOrderCreateOrConnectWithoutHistoryInput
    connect?: ShippingOrderWhereUniqueInput
  }

  export type ShippingOrderUpdateOneRequiredWithoutHistoryNestedInput = {
    create?: XOR<ShippingOrderCreateWithoutHistoryInput, ShippingOrderUncheckedCreateWithoutHistoryInput>
    connectOrCreate?: ShippingOrderCreateOrConnectWithoutHistoryInput
    upsert?: ShippingOrderUpsertWithoutHistoryInput
    connect?: ShippingOrderWhereUniqueInput
    update?: XOR<XOR<ShippingOrderUpdateToOneWithWhereWithoutHistoryInput, ShippingOrderUpdateWithoutHistoryInput>, ShippingOrderUncheckedUpdateWithoutHistoryInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ShippingRateCreateWithoutCourierInput = {
    id?: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    estimatedDays: string
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingRateUncheckedCreateWithoutCourierInput = {
    id?: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    estimatedDays: string
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingRateCreateOrConnectWithoutCourierInput = {
    where: ShippingRateWhereUniqueInput
    create: XOR<ShippingRateCreateWithoutCourierInput, ShippingRateUncheckedCreateWithoutCourierInput>
  }

  export type ShippingRateCreateManyCourierInputEnvelope = {
    data: ShippingRateCreateManyCourierInput | ShippingRateCreateManyCourierInput[]
    skipDuplicates?: boolean
  }

  export type ShippingOrderCreateWithoutCourierInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    history?: ShippingStatusHistoryCreateNestedManyWithoutShippingOrderInput
  }

  export type ShippingOrderUncheckedCreateWithoutCourierInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    history?: ShippingStatusHistoryUncheckedCreateNestedManyWithoutShippingOrderInput
  }

  export type ShippingOrderCreateOrConnectWithoutCourierInput = {
    where: ShippingOrderWhereUniqueInput
    create: XOR<ShippingOrderCreateWithoutCourierInput, ShippingOrderUncheckedCreateWithoutCourierInput>
  }

  export type ShippingOrderCreateManyCourierInputEnvelope = {
    data: ShippingOrderCreateManyCourierInput | ShippingOrderCreateManyCourierInput[]
    skipDuplicates?: boolean
  }

  export type ShippingRateUpsertWithWhereUniqueWithoutCourierInput = {
    where: ShippingRateWhereUniqueInput
    update: XOR<ShippingRateUpdateWithoutCourierInput, ShippingRateUncheckedUpdateWithoutCourierInput>
    create: XOR<ShippingRateCreateWithoutCourierInput, ShippingRateUncheckedCreateWithoutCourierInput>
  }

  export type ShippingRateUpdateWithWhereUniqueWithoutCourierInput = {
    where: ShippingRateWhereUniqueInput
    data: XOR<ShippingRateUpdateWithoutCourierInput, ShippingRateUncheckedUpdateWithoutCourierInput>
  }

  export type ShippingRateUpdateManyWithWhereWithoutCourierInput = {
    where: ShippingRateScalarWhereInput
    data: XOR<ShippingRateUpdateManyMutationInput, ShippingRateUncheckedUpdateManyWithoutCourierInput>
  }

  export type ShippingRateScalarWhereInput = {
    AND?: ShippingRateScalarWhereInput | ShippingRateScalarWhereInput[]
    OR?: ShippingRateScalarWhereInput[]
    NOT?: ShippingRateScalarWhereInput | ShippingRateScalarWhereInput[]
    id?: StringFilter<"ShippingRate"> | string
    courierId?: StringFilter<"ShippingRate"> | string
    originCity?: StringFilter<"ShippingRate"> | string
    destinationCity?: StringFilter<"ShippingRate"> | string
    serviceCode?: StringFilter<"ShippingRate"> | string
    weight?: IntFilter<"ShippingRate"> | number
    cost?: DecimalFilter<"ShippingRate"> | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFilter<"ShippingRate"> | string
    createdBy?: StringNullableFilter<"ShippingRate"> | string | null
    updatedBy?: StringNullableFilter<"ShippingRate"> | string | null
    createdAt?: DateTimeFilter<"ShippingRate"> | Date | string
    updatedAt?: DateTimeFilter<"ShippingRate"> | Date | string
  }

  export type ShippingOrderUpsertWithWhereUniqueWithoutCourierInput = {
    where: ShippingOrderWhereUniqueInput
    update: XOR<ShippingOrderUpdateWithoutCourierInput, ShippingOrderUncheckedUpdateWithoutCourierInput>
    create: XOR<ShippingOrderCreateWithoutCourierInput, ShippingOrderUncheckedCreateWithoutCourierInput>
  }

  export type ShippingOrderUpdateWithWhereUniqueWithoutCourierInput = {
    where: ShippingOrderWhereUniqueInput
    data: XOR<ShippingOrderUpdateWithoutCourierInput, ShippingOrderUncheckedUpdateWithoutCourierInput>
  }

  export type ShippingOrderUpdateManyWithWhereWithoutCourierInput = {
    where: ShippingOrderScalarWhereInput
    data: XOR<ShippingOrderUpdateManyMutationInput, ShippingOrderUncheckedUpdateManyWithoutCourierInput>
  }

  export type ShippingOrderScalarWhereInput = {
    AND?: ShippingOrderScalarWhereInput | ShippingOrderScalarWhereInput[]
    OR?: ShippingOrderScalarWhereInput[]
    NOT?: ShippingOrderScalarWhereInput | ShippingOrderScalarWhereInput[]
    id?: StringFilter<"ShippingOrder"> | string
    orderId?: StringFilter<"ShippingOrder"> | string
    sellerId?: StringNullableFilter<"ShippingOrder"> | string | null
    courierId?: StringFilter<"ShippingOrder"> | string
    courierName?: StringFilter<"ShippingOrder"> | string
    serviceCode?: StringFilter<"ShippingOrder"> | string
    serviceName?: StringFilter<"ShippingOrder"> | string
    trackingNumber?: StringNullableFilter<"ShippingOrder"> | string | null
    originAddress?: JsonFilter<"ShippingOrder">
    destinationAddress?: JsonFilter<"ShippingOrder">
    weight?: IntFilter<"ShippingOrder"> | number
    cost?: DecimalFilter<"ShippingOrder"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"ShippingOrder"> | string
    estimatedDelivery?: StringNullableFilter<"ShippingOrder"> | string | null
    notes?: StringNullableFilter<"ShippingOrder"> | string | null
    shippedAt?: DateTimeNullableFilter<"ShippingOrder"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"ShippingOrder"> | Date | string | null
    createdAt?: DateTimeFilter<"ShippingOrder"> | Date | string
    updatedAt?: DateTimeFilter<"ShippingOrder"> | Date | string
  }

  export type CourierCreateWithoutRatesInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: ShippingOrderCreateNestedManyWithoutCourierInput
  }

  export type CourierUncheckedCreateWithoutRatesInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orders?: ShippingOrderUncheckedCreateNestedManyWithoutCourierInput
  }

  export type CourierCreateOrConnectWithoutRatesInput = {
    where: CourierWhereUniqueInput
    create: XOR<CourierCreateWithoutRatesInput, CourierUncheckedCreateWithoutRatesInput>
  }

  export type CourierUpsertWithoutRatesInput = {
    update: XOR<CourierUpdateWithoutRatesInput, CourierUncheckedUpdateWithoutRatesInput>
    create: XOR<CourierCreateWithoutRatesInput, CourierUncheckedCreateWithoutRatesInput>
    where?: CourierWhereInput
  }

  export type CourierUpdateToOneWithWhereWithoutRatesInput = {
    where?: CourierWhereInput
    data: XOR<CourierUpdateWithoutRatesInput, CourierUncheckedUpdateWithoutRatesInput>
  }

  export type CourierUpdateWithoutRatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: ShippingOrderUpdateManyWithoutCourierNestedInput
  }

  export type CourierUncheckedUpdateWithoutRatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orders?: ShippingOrderUncheckedUpdateManyWithoutCourierNestedInput
  }

  export type CourierCreateWithoutOrdersInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    rates?: ShippingRateCreateNestedManyWithoutCourierInput
  }

  export type CourierUncheckedCreateWithoutOrdersInput = {
    id?: string
    name: string
    code: string
    services: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    rates?: ShippingRateUncheckedCreateNestedManyWithoutCourierInput
  }

  export type CourierCreateOrConnectWithoutOrdersInput = {
    where: CourierWhereUniqueInput
    create: XOR<CourierCreateWithoutOrdersInput, CourierUncheckedCreateWithoutOrdersInput>
  }

  export type ShippingStatusHistoryCreateWithoutShippingOrderInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    location?: string | null
    note?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    location?: string | null
    note?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingStatusHistoryCreateOrConnectWithoutShippingOrderInput = {
    where: ShippingStatusHistoryWhereUniqueInput
    create: XOR<ShippingStatusHistoryCreateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput>
  }

  export type ShippingStatusHistoryCreateManyShippingOrderInputEnvelope = {
    data: ShippingStatusHistoryCreateManyShippingOrderInput | ShippingStatusHistoryCreateManyShippingOrderInput[]
    skipDuplicates?: boolean
  }

  export type CourierUpsertWithoutOrdersInput = {
    update: XOR<CourierUpdateWithoutOrdersInput, CourierUncheckedUpdateWithoutOrdersInput>
    create: XOR<CourierCreateWithoutOrdersInput, CourierUncheckedCreateWithoutOrdersInput>
    where?: CourierWhereInput
  }

  export type CourierUpdateToOneWithWhereWithoutOrdersInput = {
    where?: CourierWhereInput
    data: XOR<CourierUpdateWithoutOrdersInput, CourierUncheckedUpdateWithoutOrdersInput>
  }

  export type CourierUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rates?: ShippingRateUpdateManyWithoutCourierNestedInput
  }

  export type CourierUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    services?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rates?: ShippingRateUncheckedUpdateManyWithoutCourierNestedInput
  }

  export type ShippingStatusHistoryUpsertWithWhereUniqueWithoutShippingOrderInput = {
    where: ShippingStatusHistoryWhereUniqueInput
    update: XOR<ShippingStatusHistoryUpdateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedUpdateWithoutShippingOrderInput>
    create: XOR<ShippingStatusHistoryCreateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedCreateWithoutShippingOrderInput>
  }

  export type ShippingStatusHistoryUpdateWithWhereUniqueWithoutShippingOrderInput = {
    where: ShippingStatusHistoryWhereUniqueInput
    data: XOR<ShippingStatusHistoryUpdateWithoutShippingOrderInput, ShippingStatusHistoryUncheckedUpdateWithoutShippingOrderInput>
  }

  export type ShippingStatusHistoryUpdateManyWithWhereWithoutShippingOrderInput = {
    where: ShippingStatusHistoryScalarWhereInput
    data: XOR<ShippingStatusHistoryUpdateManyMutationInput, ShippingStatusHistoryUncheckedUpdateManyWithoutShippingOrderInput>
  }

  export type ShippingStatusHistoryScalarWhereInput = {
    AND?: ShippingStatusHistoryScalarWhereInput | ShippingStatusHistoryScalarWhereInput[]
    OR?: ShippingStatusHistoryScalarWhereInput[]
    NOT?: ShippingStatusHistoryScalarWhereInput | ShippingStatusHistoryScalarWhereInput[]
    id?: StringFilter<"ShippingStatusHistory"> | string
    shippingOrderId?: StringFilter<"ShippingStatusHistory"> | string
    fromStatus?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    toStatus?: StringFilter<"ShippingStatusHistory"> | string
    location?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    note?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    updatedBy?: StringNullableFilter<"ShippingStatusHistory"> | string | null
    createdAt?: DateTimeFilter<"ShippingStatusHistory"> | Date | string
  }

  export type ShippingOrderCreateWithoutHistoryInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    courier: CourierCreateNestedOneWithoutOrdersInput
  }

  export type ShippingOrderUncheckedCreateWithoutHistoryInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierId: string
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingOrderCreateOrConnectWithoutHistoryInput = {
    where: ShippingOrderWhereUniqueInput
    create: XOR<ShippingOrderCreateWithoutHistoryInput, ShippingOrderUncheckedCreateWithoutHistoryInput>
  }

  export type ShippingOrderUpsertWithoutHistoryInput = {
    update: XOR<ShippingOrderUpdateWithoutHistoryInput, ShippingOrderUncheckedUpdateWithoutHistoryInput>
    create: XOR<ShippingOrderCreateWithoutHistoryInput, ShippingOrderUncheckedCreateWithoutHistoryInput>
    where?: ShippingOrderWhereInput
  }

  export type ShippingOrderUpdateToOneWithWhereWithoutHistoryInput = {
    where?: ShippingOrderWhereInput
    data: XOR<ShippingOrderUpdateWithoutHistoryInput, ShippingOrderUncheckedUpdateWithoutHistoryInput>
  }

  export type ShippingOrderUpdateWithoutHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    courier?: CourierUpdateOneRequiredWithoutOrdersNestedInput
  }

  export type ShippingOrderUncheckedUpdateWithoutHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierId?: StringFieldUpdateOperationsInput | string
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingRateCreateManyCourierInput = {
    id?: string
    originCity: string
    destinationCity: string
    serviceCode: string
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    estimatedDays: string
    createdBy?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingOrderCreateManyCourierInput = {
    id?: string
    orderId: string
    sellerId?: string | null
    courierName: string
    serviceCode: string
    serviceName: string
    trackingNumber?: string | null
    originAddress: JsonNullValueInput | InputJsonValue
    destinationAddress: JsonNullValueInput | InputJsonValue
    weight: number
    cost: Decimal | DecimalJsLike | number | string
    status?: string
    estimatedDelivery?: string | null
    notes?: string | null
    shippedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShippingRateUpdateWithoutCourierInput = {
    id?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingRateUncheckedUpdateWithoutCourierInput = {
    id?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingRateUncheckedUpdateManyWithoutCourierInput = {
    id?: StringFieldUpdateOperationsInput | string
    originCity?: StringFieldUpdateOperationsInput | string
    destinationCity?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    estimatedDays?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingOrderUpdateWithoutCourierInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    history?: ShippingStatusHistoryUpdateManyWithoutShippingOrderNestedInput
  }

  export type ShippingOrderUncheckedUpdateWithoutCourierInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    history?: ShippingStatusHistoryUncheckedUpdateManyWithoutShippingOrderNestedInput
  }

  export type ShippingOrderUncheckedUpdateManyWithoutCourierInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    sellerId?: NullableStringFieldUpdateOperationsInput | string | null
    courierName?: StringFieldUpdateOperationsInput | string
    serviceCode?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    trackingNumber?: NullableStringFieldUpdateOperationsInput | string | null
    originAddress?: JsonNullValueInput | InputJsonValue
    destinationAddress?: JsonNullValueInput | InputJsonValue
    weight?: IntFieldUpdateOperationsInput | number
    cost?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    estimatedDelivery?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    shippedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingStatusHistoryCreateManyShippingOrderInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    location?: string | null
    note?: string | null
    updatedBy?: string | null
    createdAt?: Date | string
  }

  export type ShippingStatusHistoryUpdateWithoutShippingOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingStatusHistoryUncheckedUpdateWithoutShippingOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShippingStatusHistoryUncheckedUpdateManyWithoutShippingOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use CourierCountOutputTypeDefaultArgs instead
     */
    export type CourierCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CourierCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShippingOrderCountOutputTypeDefaultArgs instead
     */
    export type ShippingOrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShippingOrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CourierDefaultArgs instead
     */
    export type CourierArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CourierDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShippingRateDefaultArgs instead
     */
    export type ShippingRateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShippingRateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShippingOrderDefaultArgs instead
     */
    export type ShippingOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShippingOrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShippingStatusHistoryDefaultArgs instead
     */
    export type ShippingStatusHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShippingStatusHistoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OutboxEventDefaultArgs instead
     */
    export type OutboxEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OutboxEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShippingQuoteDefaultArgs instead
     */
    export type ShippingQuoteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShippingQuoteDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}

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
 * Model DailySalesReport
 * 
 */
export type DailySalesReport = $Result.DefaultSelection<Prisma.$DailySalesReportPayload>
/**
 * Model MonthlySalesReport
 * 
 */
export type MonthlySalesReport = $Result.DefaultSelection<Prisma.$MonthlySalesReportPayload>
/**
 * Model ProductSalesReport
 * 
 */
export type ProductSalesReport = $Result.DefaultSelection<Prisma.$ProductSalesReportPayload>
/**
 * Model SellerPerformanceReport
 * 
 */
export type SellerPerformanceReport = $Result.DefaultSelection<Prisma.$SellerPerformanceReportPayload>
/**
 * Model PaymentReport
 * 
 */
export type PaymentReport = $Result.DefaultSelection<Prisma.$PaymentReportPayload>
/**
 * Model CategoryPerformanceReport
 * 
 */
export type CategoryPerformanceReport = $Result.DefaultSelection<Prisma.$CategoryPerformanceReportPayload>
/**
 * Model AnalyticsEvent
 * 
 */
export type AnalyticsEvent = $Result.DefaultSelection<Prisma.$AnalyticsEventPayload>
/**
 * Model InboxEvent
 * Consumption record for one broker event as seen by one named consumer.
 * A row reaches PROCESSED in the same transaction as the report mutations it
 * caused, so a redelivery can be skipped without replaying those mutations.
 */
export type InboxEvent = $Result.DefaultSelection<Prisma.$InboxEventPayload>
/**
 * Model DailySalesProjection
 * Daily sales figures projected from the Kafka stream.
 * 
 * Deliberately separate from `daily_sales_report`, which the RabbitMQ
 * consumer owns. Running both consumers against one table would count every
 * business fact twice, because the same domain event reaches this service
 * over both paths. Keeping two tables lets the Kafka projection be rebuilt
 * and compared against the RabbitMQ-fed reports before any cutover.
 */
export type DailySalesProjection = $Result.DefaultSelection<Prisma.$DailySalesProjectionPayload>
/**
 * Model KafkaProjectionProgress
 * Per-partition progress of the Kafka projection, used for lag reporting and
 * operational visibility. Kafka remains the authority for offsets; this table
 * is observability only and is never used to decide what to consume.
 */
export type KafkaProjectionProgress = $Result.DefaultSelection<Prisma.$KafkaProjectionProgressPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more DailySalesReports
 * const dailySalesReports = await prisma.dailySalesReport.findMany()
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
   * // Fetch zero or more DailySalesReports
   * const dailySalesReports = await prisma.dailySalesReport.findMany()
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
   * `prisma.dailySalesReport`: Exposes CRUD operations for the **DailySalesReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailySalesReports
    * const dailySalesReports = await prisma.dailySalesReport.findMany()
    * ```
    */
  get dailySalesReport(): Prisma.DailySalesReportDelegate<ExtArgs>;

  /**
   * `prisma.monthlySalesReport`: Exposes CRUD operations for the **MonthlySalesReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MonthlySalesReports
    * const monthlySalesReports = await prisma.monthlySalesReport.findMany()
    * ```
    */
  get monthlySalesReport(): Prisma.MonthlySalesReportDelegate<ExtArgs>;

  /**
   * `prisma.productSalesReport`: Exposes CRUD operations for the **ProductSalesReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductSalesReports
    * const productSalesReports = await prisma.productSalesReport.findMany()
    * ```
    */
  get productSalesReport(): Prisma.ProductSalesReportDelegate<ExtArgs>;

  /**
   * `prisma.sellerPerformanceReport`: Exposes CRUD operations for the **SellerPerformanceReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SellerPerformanceReports
    * const sellerPerformanceReports = await prisma.sellerPerformanceReport.findMany()
    * ```
    */
  get sellerPerformanceReport(): Prisma.SellerPerformanceReportDelegate<ExtArgs>;

  /**
   * `prisma.paymentReport`: Exposes CRUD operations for the **PaymentReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PaymentReports
    * const paymentReports = await prisma.paymentReport.findMany()
    * ```
    */
  get paymentReport(): Prisma.PaymentReportDelegate<ExtArgs>;

  /**
   * `prisma.categoryPerformanceReport`: Exposes CRUD operations for the **CategoryPerformanceReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CategoryPerformanceReports
    * const categoryPerformanceReports = await prisma.categoryPerformanceReport.findMany()
    * ```
    */
  get categoryPerformanceReport(): Prisma.CategoryPerformanceReportDelegate<ExtArgs>;

  /**
   * `prisma.analyticsEvent`: Exposes CRUD operations for the **AnalyticsEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AnalyticsEvents
    * const analyticsEvents = await prisma.analyticsEvent.findMany()
    * ```
    */
  get analyticsEvent(): Prisma.AnalyticsEventDelegate<ExtArgs>;

  /**
   * `prisma.inboxEvent`: Exposes CRUD operations for the **InboxEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InboxEvents
    * const inboxEvents = await prisma.inboxEvent.findMany()
    * ```
    */
  get inboxEvent(): Prisma.InboxEventDelegate<ExtArgs>;

  /**
   * `prisma.dailySalesProjection`: Exposes CRUD operations for the **DailySalesProjection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailySalesProjections
    * const dailySalesProjections = await prisma.dailySalesProjection.findMany()
    * ```
    */
  get dailySalesProjection(): Prisma.DailySalesProjectionDelegate<ExtArgs>;

  /**
   * `prisma.kafkaProjectionProgress`: Exposes CRUD operations for the **KafkaProjectionProgress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KafkaProjectionProgresses
    * const kafkaProjectionProgresses = await prisma.kafkaProjectionProgress.findMany()
    * ```
    */
  get kafkaProjectionProgress(): Prisma.KafkaProjectionProgressDelegate<ExtArgs>;
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
    DailySalesReport: 'DailySalesReport',
    MonthlySalesReport: 'MonthlySalesReport',
    ProductSalesReport: 'ProductSalesReport',
    SellerPerformanceReport: 'SellerPerformanceReport',
    PaymentReport: 'PaymentReport',
    CategoryPerformanceReport: 'CategoryPerformanceReport',
    AnalyticsEvent: 'AnalyticsEvent',
    InboxEvent: 'InboxEvent',
    DailySalesProjection: 'DailySalesProjection',
    KafkaProjectionProgress: 'KafkaProjectionProgress'
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
      modelProps: "dailySalesReport" | "monthlySalesReport" | "productSalesReport" | "sellerPerformanceReport" | "paymentReport" | "categoryPerformanceReport" | "analyticsEvent" | "inboxEvent" | "dailySalesProjection" | "kafkaProjectionProgress"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      DailySalesReport: {
        payload: Prisma.$DailySalesReportPayload<ExtArgs>
        fields: Prisma.DailySalesReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailySalesReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailySalesReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>
          }
          findFirst: {
            args: Prisma.DailySalesReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailySalesReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>
          }
          findMany: {
            args: Prisma.DailySalesReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>[]
          }
          create: {
            args: Prisma.DailySalesReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>
          }
          createMany: {
            args: Prisma.DailySalesReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DailySalesReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>[]
          }
          delete: {
            args: Prisma.DailySalesReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>
          }
          update: {
            args: Prisma.DailySalesReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>
          }
          deleteMany: {
            args: Prisma.DailySalesReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailySalesReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DailySalesReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesReportPayload>
          }
          aggregate: {
            args: Prisma.DailySalesReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailySalesReport>
          }
          groupBy: {
            args: Prisma.DailySalesReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailySalesReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailySalesReportCountArgs<ExtArgs>
            result: $Utils.Optional<DailySalesReportCountAggregateOutputType> | number
          }
        }
      }
      MonthlySalesReport: {
        payload: Prisma.$MonthlySalesReportPayload<ExtArgs>
        fields: Prisma.MonthlySalesReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MonthlySalesReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MonthlySalesReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>
          }
          findFirst: {
            args: Prisma.MonthlySalesReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MonthlySalesReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>
          }
          findMany: {
            args: Prisma.MonthlySalesReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>[]
          }
          create: {
            args: Prisma.MonthlySalesReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>
          }
          createMany: {
            args: Prisma.MonthlySalesReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MonthlySalesReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>[]
          }
          delete: {
            args: Prisma.MonthlySalesReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>
          }
          update: {
            args: Prisma.MonthlySalesReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>
          }
          deleteMany: {
            args: Prisma.MonthlySalesReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MonthlySalesReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MonthlySalesReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MonthlySalesReportPayload>
          }
          aggregate: {
            args: Prisma.MonthlySalesReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMonthlySalesReport>
          }
          groupBy: {
            args: Prisma.MonthlySalesReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<MonthlySalesReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.MonthlySalesReportCountArgs<ExtArgs>
            result: $Utils.Optional<MonthlySalesReportCountAggregateOutputType> | number
          }
        }
      }
      ProductSalesReport: {
        payload: Prisma.$ProductSalesReportPayload<ExtArgs>
        fields: Prisma.ProductSalesReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductSalesReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductSalesReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>
          }
          findFirst: {
            args: Prisma.ProductSalesReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductSalesReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>
          }
          findMany: {
            args: Prisma.ProductSalesReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>[]
          }
          create: {
            args: Prisma.ProductSalesReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>
          }
          createMany: {
            args: Prisma.ProductSalesReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductSalesReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>[]
          }
          delete: {
            args: Prisma.ProductSalesReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>
          }
          update: {
            args: Prisma.ProductSalesReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>
          }
          deleteMany: {
            args: Prisma.ProductSalesReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductSalesReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductSalesReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductSalesReportPayload>
          }
          aggregate: {
            args: Prisma.ProductSalesReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductSalesReport>
          }
          groupBy: {
            args: Prisma.ProductSalesReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductSalesReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductSalesReportCountArgs<ExtArgs>
            result: $Utils.Optional<ProductSalesReportCountAggregateOutputType> | number
          }
        }
      }
      SellerPerformanceReport: {
        payload: Prisma.$SellerPerformanceReportPayload<ExtArgs>
        fields: Prisma.SellerPerformanceReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SellerPerformanceReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SellerPerformanceReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>
          }
          findFirst: {
            args: Prisma.SellerPerformanceReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SellerPerformanceReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>
          }
          findMany: {
            args: Prisma.SellerPerformanceReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>[]
          }
          create: {
            args: Prisma.SellerPerformanceReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>
          }
          createMany: {
            args: Prisma.SellerPerformanceReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SellerPerformanceReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>[]
          }
          delete: {
            args: Prisma.SellerPerformanceReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>
          }
          update: {
            args: Prisma.SellerPerformanceReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>
          }
          deleteMany: {
            args: Prisma.SellerPerformanceReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SellerPerformanceReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SellerPerformanceReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SellerPerformanceReportPayload>
          }
          aggregate: {
            args: Prisma.SellerPerformanceReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSellerPerformanceReport>
          }
          groupBy: {
            args: Prisma.SellerPerformanceReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<SellerPerformanceReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.SellerPerformanceReportCountArgs<ExtArgs>
            result: $Utils.Optional<SellerPerformanceReportCountAggregateOutputType> | number
          }
        }
      }
      PaymentReport: {
        payload: Prisma.$PaymentReportPayload<ExtArgs>
        fields: Prisma.PaymentReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaymentReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaymentReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>
          }
          findFirst: {
            args: Prisma.PaymentReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaymentReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>
          }
          findMany: {
            args: Prisma.PaymentReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>[]
          }
          create: {
            args: Prisma.PaymentReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>
          }
          createMany: {
            args: Prisma.PaymentReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaymentReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>[]
          }
          delete: {
            args: Prisma.PaymentReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>
          }
          update: {
            args: Prisma.PaymentReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>
          }
          deleteMany: {
            args: Prisma.PaymentReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaymentReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PaymentReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentReportPayload>
          }
          aggregate: {
            args: Prisma.PaymentReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePaymentReport>
          }
          groupBy: {
            args: Prisma.PaymentReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaymentReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaymentReportCountArgs<ExtArgs>
            result: $Utils.Optional<PaymentReportCountAggregateOutputType> | number
          }
        }
      }
      CategoryPerformanceReport: {
        payload: Prisma.$CategoryPerformanceReportPayload<ExtArgs>
        fields: Prisma.CategoryPerformanceReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryPerformanceReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryPerformanceReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>
          }
          findFirst: {
            args: Prisma.CategoryPerformanceReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryPerformanceReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>
          }
          findMany: {
            args: Prisma.CategoryPerformanceReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>[]
          }
          create: {
            args: Prisma.CategoryPerformanceReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>
          }
          createMany: {
            args: Prisma.CategoryPerformanceReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoryPerformanceReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>[]
          }
          delete: {
            args: Prisma.CategoryPerformanceReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>
          }
          update: {
            args: Prisma.CategoryPerformanceReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>
          }
          deleteMany: {
            args: Prisma.CategoryPerformanceReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryPerformanceReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CategoryPerformanceReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPerformanceReportPayload>
          }
          aggregate: {
            args: Prisma.CategoryPerformanceReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategoryPerformanceReport>
          }
          groupBy: {
            args: Prisma.CategoryPerformanceReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryPerformanceReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryPerformanceReportCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryPerformanceReportCountAggregateOutputType> | number
          }
        }
      }
      AnalyticsEvent: {
        payload: Prisma.$AnalyticsEventPayload<ExtArgs>
        fields: Prisma.AnalyticsEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnalyticsEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnalyticsEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          findFirst: {
            args: Prisma.AnalyticsEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnalyticsEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          findMany: {
            args: Prisma.AnalyticsEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[]
          }
          create: {
            args: Prisma.AnalyticsEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          createMany: {
            args: Prisma.AnalyticsEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnalyticsEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[]
          }
          delete: {
            args: Prisma.AnalyticsEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          update: {
            args: Prisma.AnalyticsEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          deleteMany: {
            args: Prisma.AnalyticsEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnalyticsEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AnalyticsEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          aggregate: {
            args: Prisma.AnalyticsEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnalyticsEvent>
          }
          groupBy: {
            args: Prisma.AnalyticsEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnalyticsEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnalyticsEventCountArgs<ExtArgs>
            result: $Utils.Optional<AnalyticsEventCountAggregateOutputType> | number
          }
        }
      }
      InboxEvent: {
        payload: Prisma.$InboxEventPayload<ExtArgs>
        fields: Prisma.InboxEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InboxEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InboxEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>
          }
          findFirst: {
            args: Prisma.InboxEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InboxEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>
          }
          findMany: {
            args: Prisma.InboxEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>[]
          }
          create: {
            args: Prisma.InboxEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>
          }
          createMany: {
            args: Prisma.InboxEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InboxEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>[]
          }
          delete: {
            args: Prisma.InboxEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>
          }
          update: {
            args: Prisma.InboxEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>
          }
          deleteMany: {
            args: Prisma.InboxEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InboxEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InboxEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxEventPayload>
          }
          aggregate: {
            args: Prisma.InboxEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInboxEvent>
          }
          groupBy: {
            args: Prisma.InboxEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<InboxEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.InboxEventCountArgs<ExtArgs>
            result: $Utils.Optional<InboxEventCountAggregateOutputType> | number
          }
        }
      }
      DailySalesProjection: {
        payload: Prisma.$DailySalesProjectionPayload<ExtArgs>
        fields: Prisma.DailySalesProjectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailySalesProjectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailySalesProjectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>
          }
          findFirst: {
            args: Prisma.DailySalesProjectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailySalesProjectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>
          }
          findMany: {
            args: Prisma.DailySalesProjectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>[]
          }
          create: {
            args: Prisma.DailySalesProjectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>
          }
          createMany: {
            args: Prisma.DailySalesProjectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DailySalesProjectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>[]
          }
          delete: {
            args: Prisma.DailySalesProjectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>
          }
          update: {
            args: Prisma.DailySalesProjectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>
          }
          deleteMany: {
            args: Prisma.DailySalesProjectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailySalesProjectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DailySalesProjectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailySalesProjectionPayload>
          }
          aggregate: {
            args: Prisma.DailySalesProjectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailySalesProjection>
          }
          groupBy: {
            args: Prisma.DailySalesProjectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailySalesProjectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailySalesProjectionCountArgs<ExtArgs>
            result: $Utils.Optional<DailySalesProjectionCountAggregateOutputType> | number
          }
        }
      }
      KafkaProjectionProgress: {
        payload: Prisma.$KafkaProjectionProgressPayload<ExtArgs>
        fields: Prisma.KafkaProjectionProgressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KafkaProjectionProgressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KafkaProjectionProgressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>
          }
          findFirst: {
            args: Prisma.KafkaProjectionProgressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KafkaProjectionProgressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>
          }
          findMany: {
            args: Prisma.KafkaProjectionProgressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>[]
          }
          create: {
            args: Prisma.KafkaProjectionProgressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>
          }
          createMany: {
            args: Prisma.KafkaProjectionProgressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KafkaProjectionProgressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>[]
          }
          delete: {
            args: Prisma.KafkaProjectionProgressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>
          }
          update: {
            args: Prisma.KafkaProjectionProgressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>
          }
          deleteMany: {
            args: Prisma.KafkaProjectionProgressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KafkaProjectionProgressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.KafkaProjectionProgressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KafkaProjectionProgressPayload>
          }
          aggregate: {
            args: Prisma.KafkaProjectionProgressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKafkaProjectionProgress>
          }
          groupBy: {
            args: Prisma.KafkaProjectionProgressGroupByArgs<ExtArgs>
            result: $Utils.Optional<KafkaProjectionProgressGroupByOutputType>[]
          }
          count: {
            args: Prisma.KafkaProjectionProgressCountArgs<ExtArgs>
            result: $Utils.Optional<KafkaProjectionProgressCountAggregateOutputType> | number
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
   * Models
   */

  /**
   * Model DailySalesReport
   */

  export type AggregateDailySalesReport = {
    _count: DailySalesReportCountAggregateOutputType | null
    _avg: DailySalesReportAvgAggregateOutputType | null
    _sum: DailySalesReportSumAggregateOutputType | null
    _min: DailySalesReportMinAggregateOutputType | null
    _max: DailySalesReportMaxAggregateOutputType | null
  }

  export type DailySalesReportAvgAggregateOutputType = {
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
  }

  export type DailySalesReportSumAggregateOutputType = {
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
  }

  export type DailySalesReportMinAggregateOutputType = {
    id: string | null
    date: Date | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DailySalesReportMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DailySalesReportCountAggregateOutputType = {
    id: number
    date: number
    totalOrders: number
    totalCompletedOrders: number
    totalCancelledOrders: number
    totalRevenue: number
    totalItemsSold: number
    averageOrderValue: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DailySalesReportAvgAggregateInputType = {
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
  }

  export type DailySalesReportSumAggregateInputType = {
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
  }

  export type DailySalesReportMinAggregateInputType = {
    id?: true
    date?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DailySalesReportMaxAggregateInputType = {
    id?: true
    date?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DailySalesReportCountAggregateInputType = {
    id?: true
    date?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DailySalesReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailySalesReport to aggregate.
     */
    where?: DailySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesReports to fetch.
     */
    orderBy?: DailySalesReportOrderByWithRelationInput | DailySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailySalesReports
    **/
    _count?: true | DailySalesReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailySalesReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailySalesReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailySalesReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailySalesReportMaxAggregateInputType
  }

  export type GetDailySalesReportAggregateType<T extends DailySalesReportAggregateArgs> = {
        [P in keyof T & keyof AggregateDailySalesReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailySalesReport[P]>
      : GetScalarType<T[P], AggregateDailySalesReport[P]>
  }




  export type DailySalesReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailySalesReportWhereInput
    orderBy?: DailySalesReportOrderByWithAggregationInput | DailySalesReportOrderByWithAggregationInput[]
    by: DailySalesReportScalarFieldEnum[] | DailySalesReportScalarFieldEnum
    having?: DailySalesReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailySalesReportCountAggregateInputType | true
    _avg?: DailySalesReportAvgAggregateInputType
    _sum?: DailySalesReportSumAggregateInputType
    _min?: DailySalesReportMinAggregateInputType
    _max?: DailySalesReportMaxAggregateInputType
  }

  export type DailySalesReportGroupByOutputType = {
    id: string
    date: Date
    totalOrders: number
    totalCompletedOrders: number
    totalCancelledOrders: number
    totalRevenue: Decimal
    totalItemsSold: number
    averageOrderValue: Decimal
    createdAt: Date
    updatedAt: Date
    _count: DailySalesReportCountAggregateOutputType | null
    _avg: DailySalesReportAvgAggregateOutputType | null
    _sum: DailySalesReportSumAggregateOutputType | null
    _min: DailySalesReportMinAggregateOutputType | null
    _max: DailySalesReportMaxAggregateOutputType | null
  }

  type GetDailySalesReportGroupByPayload<T extends DailySalesReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailySalesReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailySalesReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailySalesReportGroupByOutputType[P]>
            : GetScalarType<T[P], DailySalesReportGroupByOutputType[P]>
        }
      >
    >


  export type DailySalesReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    averageOrderValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dailySalesReport"]>

  export type DailySalesReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    averageOrderValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dailySalesReport"]>

  export type DailySalesReportSelectScalar = {
    id?: boolean
    date?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    averageOrderValue?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $DailySalesReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailySalesReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      totalOrders: number
      totalCompletedOrders: number
      totalCancelledOrders: number
      totalRevenue: Prisma.Decimal
      totalItemsSold: number
      averageOrderValue: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dailySalesReport"]>
    composites: {}
  }

  type DailySalesReportGetPayload<S extends boolean | null | undefined | DailySalesReportDefaultArgs> = $Result.GetResult<Prisma.$DailySalesReportPayload, S>

  type DailySalesReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DailySalesReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DailySalesReportCountAggregateInputType | true
    }

  export interface DailySalesReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailySalesReport'], meta: { name: 'DailySalesReport' } }
    /**
     * Find zero or one DailySalesReport that matches the filter.
     * @param {DailySalesReportFindUniqueArgs} args - Arguments to find a DailySalesReport
     * @example
     * // Get one DailySalesReport
     * const dailySalesReport = await prisma.dailySalesReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailySalesReportFindUniqueArgs>(args: SelectSubset<T, DailySalesReportFindUniqueArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DailySalesReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DailySalesReportFindUniqueOrThrowArgs} args - Arguments to find a DailySalesReport
     * @example
     * // Get one DailySalesReport
     * const dailySalesReport = await prisma.dailySalesReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailySalesReportFindUniqueOrThrowArgs>(args: SelectSubset<T, DailySalesReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DailySalesReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportFindFirstArgs} args - Arguments to find a DailySalesReport
     * @example
     * // Get one DailySalesReport
     * const dailySalesReport = await prisma.dailySalesReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailySalesReportFindFirstArgs>(args?: SelectSubset<T, DailySalesReportFindFirstArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DailySalesReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportFindFirstOrThrowArgs} args - Arguments to find a DailySalesReport
     * @example
     * // Get one DailySalesReport
     * const dailySalesReport = await prisma.dailySalesReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailySalesReportFindFirstOrThrowArgs>(args?: SelectSubset<T, DailySalesReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DailySalesReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailySalesReports
     * const dailySalesReports = await prisma.dailySalesReport.findMany()
     * 
     * // Get first 10 DailySalesReports
     * const dailySalesReports = await prisma.dailySalesReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailySalesReportWithIdOnly = await prisma.dailySalesReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailySalesReportFindManyArgs>(args?: SelectSubset<T, DailySalesReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DailySalesReport.
     * @param {DailySalesReportCreateArgs} args - Arguments to create a DailySalesReport.
     * @example
     * // Create one DailySalesReport
     * const DailySalesReport = await prisma.dailySalesReport.create({
     *   data: {
     *     // ... data to create a DailySalesReport
     *   }
     * })
     * 
     */
    create<T extends DailySalesReportCreateArgs>(args: SelectSubset<T, DailySalesReportCreateArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DailySalesReports.
     * @param {DailySalesReportCreateManyArgs} args - Arguments to create many DailySalesReports.
     * @example
     * // Create many DailySalesReports
     * const dailySalesReport = await prisma.dailySalesReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailySalesReportCreateManyArgs>(args?: SelectSubset<T, DailySalesReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DailySalesReports and returns the data saved in the database.
     * @param {DailySalesReportCreateManyAndReturnArgs} args - Arguments to create many DailySalesReports.
     * @example
     * // Create many DailySalesReports
     * const dailySalesReport = await prisma.dailySalesReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DailySalesReports and only return the `id`
     * const dailySalesReportWithIdOnly = await prisma.dailySalesReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DailySalesReportCreateManyAndReturnArgs>(args?: SelectSubset<T, DailySalesReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DailySalesReport.
     * @param {DailySalesReportDeleteArgs} args - Arguments to delete one DailySalesReport.
     * @example
     * // Delete one DailySalesReport
     * const DailySalesReport = await prisma.dailySalesReport.delete({
     *   where: {
     *     // ... filter to delete one DailySalesReport
     *   }
     * })
     * 
     */
    delete<T extends DailySalesReportDeleteArgs>(args: SelectSubset<T, DailySalesReportDeleteArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DailySalesReport.
     * @param {DailySalesReportUpdateArgs} args - Arguments to update one DailySalesReport.
     * @example
     * // Update one DailySalesReport
     * const dailySalesReport = await prisma.dailySalesReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailySalesReportUpdateArgs>(args: SelectSubset<T, DailySalesReportUpdateArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DailySalesReports.
     * @param {DailySalesReportDeleteManyArgs} args - Arguments to filter DailySalesReports to delete.
     * @example
     * // Delete a few DailySalesReports
     * const { count } = await prisma.dailySalesReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailySalesReportDeleteManyArgs>(args?: SelectSubset<T, DailySalesReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailySalesReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailySalesReports
     * const dailySalesReport = await prisma.dailySalesReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailySalesReportUpdateManyArgs>(args: SelectSubset<T, DailySalesReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DailySalesReport.
     * @param {DailySalesReportUpsertArgs} args - Arguments to update or create a DailySalesReport.
     * @example
     * // Update or create a DailySalesReport
     * const dailySalesReport = await prisma.dailySalesReport.upsert({
     *   create: {
     *     // ... data to create a DailySalesReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailySalesReport we want to update
     *   }
     * })
     */
    upsert<T extends DailySalesReportUpsertArgs>(args: SelectSubset<T, DailySalesReportUpsertArgs<ExtArgs>>): Prisma__DailySalesReportClient<$Result.GetResult<Prisma.$DailySalesReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DailySalesReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportCountArgs} args - Arguments to filter DailySalesReports to count.
     * @example
     * // Count the number of DailySalesReports
     * const count = await prisma.dailySalesReport.count({
     *   where: {
     *     // ... the filter for the DailySalesReports we want to count
     *   }
     * })
    **/
    count<T extends DailySalesReportCountArgs>(
      args?: Subset<T, DailySalesReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailySalesReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailySalesReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DailySalesReportAggregateArgs>(args: Subset<T, DailySalesReportAggregateArgs>): Prisma.PrismaPromise<GetDailySalesReportAggregateType<T>>

    /**
     * Group by DailySalesReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesReportGroupByArgs} args - Group by arguments.
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
      T extends DailySalesReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailySalesReportGroupByArgs['orderBy'] }
        : { orderBy?: DailySalesReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DailySalesReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailySalesReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailySalesReport model
   */
  readonly fields: DailySalesReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailySalesReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailySalesReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DailySalesReport model
   */ 
  interface DailySalesReportFieldRefs {
    readonly id: FieldRef<"DailySalesReport", 'String'>
    readonly date: FieldRef<"DailySalesReport", 'DateTime'>
    readonly totalOrders: FieldRef<"DailySalesReport", 'Int'>
    readonly totalCompletedOrders: FieldRef<"DailySalesReport", 'Int'>
    readonly totalCancelledOrders: FieldRef<"DailySalesReport", 'Int'>
    readonly totalRevenue: FieldRef<"DailySalesReport", 'Decimal'>
    readonly totalItemsSold: FieldRef<"DailySalesReport", 'Int'>
    readonly averageOrderValue: FieldRef<"DailySalesReport", 'Decimal'>
    readonly createdAt: FieldRef<"DailySalesReport", 'DateTime'>
    readonly updatedAt: FieldRef<"DailySalesReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailySalesReport findUnique
   */
  export type DailySalesReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesReport to fetch.
     */
    where: DailySalesReportWhereUniqueInput
  }

  /**
   * DailySalesReport findUniqueOrThrow
   */
  export type DailySalesReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesReport to fetch.
     */
    where: DailySalesReportWhereUniqueInput
  }

  /**
   * DailySalesReport findFirst
   */
  export type DailySalesReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesReport to fetch.
     */
    where?: DailySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesReports to fetch.
     */
    orderBy?: DailySalesReportOrderByWithRelationInput | DailySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailySalesReports.
     */
    cursor?: DailySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailySalesReports.
     */
    distinct?: DailySalesReportScalarFieldEnum | DailySalesReportScalarFieldEnum[]
  }

  /**
   * DailySalesReport findFirstOrThrow
   */
  export type DailySalesReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesReport to fetch.
     */
    where?: DailySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesReports to fetch.
     */
    orderBy?: DailySalesReportOrderByWithRelationInput | DailySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailySalesReports.
     */
    cursor?: DailySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailySalesReports.
     */
    distinct?: DailySalesReportScalarFieldEnum | DailySalesReportScalarFieldEnum[]
  }

  /**
   * DailySalesReport findMany
   */
  export type DailySalesReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesReports to fetch.
     */
    where?: DailySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesReports to fetch.
     */
    orderBy?: DailySalesReportOrderByWithRelationInput | DailySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailySalesReports.
     */
    cursor?: DailySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesReports.
     */
    skip?: number
    distinct?: DailySalesReportScalarFieldEnum | DailySalesReportScalarFieldEnum[]
  }

  /**
   * DailySalesReport create
   */
  export type DailySalesReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * The data needed to create a DailySalesReport.
     */
    data: XOR<DailySalesReportCreateInput, DailySalesReportUncheckedCreateInput>
  }

  /**
   * DailySalesReport createMany
   */
  export type DailySalesReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailySalesReports.
     */
    data: DailySalesReportCreateManyInput | DailySalesReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailySalesReport createManyAndReturn
   */
  export type DailySalesReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DailySalesReports.
     */
    data: DailySalesReportCreateManyInput | DailySalesReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailySalesReport update
   */
  export type DailySalesReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * The data needed to update a DailySalesReport.
     */
    data: XOR<DailySalesReportUpdateInput, DailySalesReportUncheckedUpdateInput>
    /**
     * Choose, which DailySalesReport to update.
     */
    where: DailySalesReportWhereUniqueInput
  }

  /**
   * DailySalesReport updateMany
   */
  export type DailySalesReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailySalesReports.
     */
    data: XOR<DailySalesReportUpdateManyMutationInput, DailySalesReportUncheckedUpdateManyInput>
    /**
     * Filter which DailySalesReports to update
     */
    where?: DailySalesReportWhereInput
  }

  /**
   * DailySalesReport upsert
   */
  export type DailySalesReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * The filter to search for the DailySalesReport to update in case it exists.
     */
    where: DailySalesReportWhereUniqueInput
    /**
     * In case the DailySalesReport found by the `where` argument doesn't exist, create a new DailySalesReport with this data.
     */
    create: XOR<DailySalesReportCreateInput, DailySalesReportUncheckedCreateInput>
    /**
     * In case the DailySalesReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailySalesReportUpdateInput, DailySalesReportUncheckedUpdateInput>
  }

  /**
   * DailySalesReport delete
   */
  export type DailySalesReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
    /**
     * Filter which DailySalesReport to delete.
     */
    where: DailySalesReportWhereUniqueInput
  }

  /**
   * DailySalesReport deleteMany
   */
  export type DailySalesReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailySalesReports to delete
     */
    where?: DailySalesReportWhereInput
  }

  /**
   * DailySalesReport without action
   */
  export type DailySalesReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesReport
     */
    select?: DailySalesReportSelect<ExtArgs> | null
  }


  /**
   * Model MonthlySalesReport
   */

  export type AggregateMonthlySalesReport = {
    _count: MonthlySalesReportCountAggregateOutputType | null
    _avg: MonthlySalesReportAvgAggregateOutputType | null
    _sum: MonthlySalesReportSumAggregateOutputType | null
    _min: MonthlySalesReportMinAggregateOutputType | null
    _max: MonthlySalesReportMaxAggregateOutputType | null
  }

  export type MonthlySalesReportAvgAggregateOutputType = {
    year: number | null
    month: number | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
    newCustomers: number | null
    newSellers: number | null
  }

  export type MonthlySalesReportSumAggregateOutputType = {
    year: number | null
    month: number | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
    newCustomers: number | null
    newSellers: number | null
  }

  export type MonthlySalesReportMinAggregateOutputType = {
    id: string | null
    year: number | null
    month: number | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
    newCustomers: number | null
    newSellers: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MonthlySalesReportMaxAggregateOutputType = {
    id: string | null
    year: number | null
    month: number | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    averageOrderValue: Decimal | null
    newCustomers: number | null
    newSellers: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MonthlySalesReportCountAggregateOutputType = {
    id: number
    year: number
    month: number
    totalOrders: number
    totalCompletedOrders: number
    totalCancelledOrders: number
    totalRevenue: number
    totalItemsSold: number
    averageOrderValue: number
    newCustomers: number
    newSellers: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MonthlySalesReportAvgAggregateInputType = {
    year?: true
    month?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    newCustomers?: true
    newSellers?: true
  }

  export type MonthlySalesReportSumAggregateInputType = {
    year?: true
    month?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    newCustomers?: true
    newSellers?: true
  }

  export type MonthlySalesReportMinAggregateInputType = {
    id?: true
    year?: true
    month?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    newCustomers?: true
    newSellers?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MonthlySalesReportMaxAggregateInputType = {
    id?: true
    year?: true
    month?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    newCustomers?: true
    newSellers?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MonthlySalesReportCountAggregateInputType = {
    id?: true
    year?: true
    month?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    averageOrderValue?: true
    newCustomers?: true
    newSellers?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MonthlySalesReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MonthlySalesReport to aggregate.
     */
    where?: MonthlySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlySalesReports to fetch.
     */
    orderBy?: MonthlySalesReportOrderByWithRelationInput | MonthlySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MonthlySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlySalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MonthlySalesReports
    **/
    _count?: true | MonthlySalesReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MonthlySalesReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MonthlySalesReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MonthlySalesReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MonthlySalesReportMaxAggregateInputType
  }

  export type GetMonthlySalesReportAggregateType<T extends MonthlySalesReportAggregateArgs> = {
        [P in keyof T & keyof AggregateMonthlySalesReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMonthlySalesReport[P]>
      : GetScalarType<T[P], AggregateMonthlySalesReport[P]>
  }




  export type MonthlySalesReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MonthlySalesReportWhereInput
    orderBy?: MonthlySalesReportOrderByWithAggregationInput | MonthlySalesReportOrderByWithAggregationInput[]
    by: MonthlySalesReportScalarFieldEnum[] | MonthlySalesReportScalarFieldEnum
    having?: MonthlySalesReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MonthlySalesReportCountAggregateInputType | true
    _avg?: MonthlySalesReportAvgAggregateInputType
    _sum?: MonthlySalesReportSumAggregateInputType
    _min?: MonthlySalesReportMinAggregateInputType
    _max?: MonthlySalesReportMaxAggregateInputType
  }

  export type MonthlySalesReportGroupByOutputType = {
    id: string
    year: number
    month: number
    totalOrders: number
    totalCompletedOrders: number
    totalCancelledOrders: number
    totalRevenue: Decimal
    totalItemsSold: number
    averageOrderValue: Decimal
    newCustomers: number
    newSellers: number
    createdAt: Date
    updatedAt: Date
    _count: MonthlySalesReportCountAggregateOutputType | null
    _avg: MonthlySalesReportAvgAggregateOutputType | null
    _sum: MonthlySalesReportSumAggregateOutputType | null
    _min: MonthlySalesReportMinAggregateOutputType | null
    _max: MonthlySalesReportMaxAggregateOutputType | null
  }

  type GetMonthlySalesReportGroupByPayload<T extends MonthlySalesReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MonthlySalesReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MonthlySalesReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MonthlySalesReportGroupByOutputType[P]>
            : GetScalarType<T[P], MonthlySalesReportGroupByOutputType[P]>
        }
      >
    >


  export type MonthlySalesReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    year?: boolean
    month?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    averageOrderValue?: boolean
    newCustomers?: boolean
    newSellers?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["monthlySalesReport"]>

  export type MonthlySalesReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    year?: boolean
    month?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    averageOrderValue?: boolean
    newCustomers?: boolean
    newSellers?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["monthlySalesReport"]>

  export type MonthlySalesReportSelectScalar = {
    id?: boolean
    year?: boolean
    month?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    averageOrderValue?: boolean
    newCustomers?: boolean
    newSellers?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $MonthlySalesReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MonthlySalesReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      year: number
      month: number
      totalOrders: number
      totalCompletedOrders: number
      totalCancelledOrders: number
      totalRevenue: Prisma.Decimal
      totalItemsSold: number
      averageOrderValue: Prisma.Decimal
      newCustomers: number
      newSellers: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["monthlySalesReport"]>
    composites: {}
  }

  type MonthlySalesReportGetPayload<S extends boolean | null | undefined | MonthlySalesReportDefaultArgs> = $Result.GetResult<Prisma.$MonthlySalesReportPayload, S>

  type MonthlySalesReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MonthlySalesReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MonthlySalesReportCountAggregateInputType | true
    }

  export interface MonthlySalesReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MonthlySalesReport'], meta: { name: 'MonthlySalesReport' } }
    /**
     * Find zero or one MonthlySalesReport that matches the filter.
     * @param {MonthlySalesReportFindUniqueArgs} args - Arguments to find a MonthlySalesReport
     * @example
     * // Get one MonthlySalesReport
     * const monthlySalesReport = await prisma.monthlySalesReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MonthlySalesReportFindUniqueArgs>(args: SelectSubset<T, MonthlySalesReportFindUniqueArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MonthlySalesReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MonthlySalesReportFindUniqueOrThrowArgs} args - Arguments to find a MonthlySalesReport
     * @example
     * // Get one MonthlySalesReport
     * const monthlySalesReport = await prisma.monthlySalesReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MonthlySalesReportFindUniqueOrThrowArgs>(args: SelectSubset<T, MonthlySalesReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MonthlySalesReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportFindFirstArgs} args - Arguments to find a MonthlySalesReport
     * @example
     * // Get one MonthlySalesReport
     * const monthlySalesReport = await prisma.monthlySalesReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MonthlySalesReportFindFirstArgs>(args?: SelectSubset<T, MonthlySalesReportFindFirstArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MonthlySalesReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportFindFirstOrThrowArgs} args - Arguments to find a MonthlySalesReport
     * @example
     * // Get one MonthlySalesReport
     * const monthlySalesReport = await prisma.monthlySalesReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MonthlySalesReportFindFirstOrThrowArgs>(args?: SelectSubset<T, MonthlySalesReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MonthlySalesReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MonthlySalesReports
     * const monthlySalesReports = await prisma.monthlySalesReport.findMany()
     * 
     * // Get first 10 MonthlySalesReports
     * const monthlySalesReports = await prisma.monthlySalesReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const monthlySalesReportWithIdOnly = await prisma.monthlySalesReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MonthlySalesReportFindManyArgs>(args?: SelectSubset<T, MonthlySalesReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MonthlySalesReport.
     * @param {MonthlySalesReportCreateArgs} args - Arguments to create a MonthlySalesReport.
     * @example
     * // Create one MonthlySalesReport
     * const MonthlySalesReport = await prisma.monthlySalesReport.create({
     *   data: {
     *     // ... data to create a MonthlySalesReport
     *   }
     * })
     * 
     */
    create<T extends MonthlySalesReportCreateArgs>(args: SelectSubset<T, MonthlySalesReportCreateArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MonthlySalesReports.
     * @param {MonthlySalesReportCreateManyArgs} args - Arguments to create many MonthlySalesReports.
     * @example
     * // Create many MonthlySalesReports
     * const monthlySalesReport = await prisma.monthlySalesReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MonthlySalesReportCreateManyArgs>(args?: SelectSubset<T, MonthlySalesReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MonthlySalesReports and returns the data saved in the database.
     * @param {MonthlySalesReportCreateManyAndReturnArgs} args - Arguments to create many MonthlySalesReports.
     * @example
     * // Create many MonthlySalesReports
     * const monthlySalesReport = await prisma.monthlySalesReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MonthlySalesReports and only return the `id`
     * const monthlySalesReportWithIdOnly = await prisma.monthlySalesReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MonthlySalesReportCreateManyAndReturnArgs>(args?: SelectSubset<T, MonthlySalesReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MonthlySalesReport.
     * @param {MonthlySalesReportDeleteArgs} args - Arguments to delete one MonthlySalesReport.
     * @example
     * // Delete one MonthlySalesReport
     * const MonthlySalesReport = await prisma.monthlySalesReport.delete({
     *   where: {
     *     // ... filter to delete one MonthlySalesReport
     *   }
     * })
     * 
     */
    delete<T extends MonthlySalesReportDeleteArgs>(args: SelectSubset<T, MonthlySalesReportDeleteArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MonthlySalesReport.
     * @param {MonthlySalesReportUpdateArgs} args - Arguments to update one MonthlySalesReport.
     * @example
     * // Update one MonthlySalesReport
     * const monthlySalesReport = await prisma.monthlySalesReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MonthlySalesReportUpdateArgs>(args: SelectSubset<T, MonthlySalesReportUpdateArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MonthlySalesReports.
     * @param {MonthlySalesReportDeleteManyArgs} args - Arguments to filter MonthlySalesReports to delete.
     * @example
     * // Delete a few MonthlySalesReports
     * const { count } = await prisma.monthlySalesReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MonthlySalesReportDeleteManyArgs>(args?: SelectSubset<T, MonthlySalesReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MonthlySalesReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MonthlySalesReports
     * const monthlySalesReport = await prisma.monthlySalesReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MonthlySalesReportUpdateManyArgs>(args: SelectSubset<T, MonthlySalesReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MonthlySalesReport.
     * @param {MonthlySalesReportUpsertArgs} args - Arguments to update or create a MonthlySalesReport.
     * @example
     * // Update or create a MonthlySalesReport
     * const monthlySalesReport = await prisma.monthlySalesReport.upsert({
     *   create: {
     *     // ... data to create a MonthlySalesReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MonthlySalesReport we want to update
     *   }
     * })
     */
    upsert<T extends MonthlySalesReportUpsertArgs>(args: SelectSubset<T, MonthlySalesReportUpsertArgs<ExtArgs>>): Prisma__MonthlySalesReportClient<$Result.GetResult<Prisma.$MonthlySalesReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MonthlySalesReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportCountArgs} args - Arguments to filter MonthlySalesReports to count.
     * @example
     * // Count the number of MonthlySalesReports
     * const count = await prisma.monthlySalesReport.count({
     *   where: {
     *     // ... the filter for the MonthlySalesReports we want to count
     *   }
     * })
    **/
    count<T extends MonthlySalesReportCountArgs>(
      args?: Subset<T, MonthlySalesReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MonthlySalesReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MonthlySalesReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MonthlySalesReportAggregateArgs>(args: Subset<T, MonthlySalesReportAggregateArgs>): Prisma.PrismaPromise<GetMonthlySalesReportAggregateType<T>>

    /**
     * Group by MonthlySalesReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlySalesReportGroupByArgs} args - Group by arguments.
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
      T extends MonthlySalesReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MonthlySalesReportGroupByArgs['orderBy'] }
        : { orderBy?: MonthlySalesReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MonthlySalesReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMonthlySalesReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MonthlySalesReport model
   */
  readonly fields: MonthlySalesReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MonthlySalesReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MonthlySalesReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the MonthlySalesReport model
   */ 
  interface MonthlySalesReportFieldRefs {
    readonly id: FieldRef<"MonthlySalesReport", 'String'>
    readonly year: FieldRef<"MonthlySalesReport", 'Int'>
    readonly month: FieldRef<"MonthlySalesReport", 'Int'>
    readonly totalOrders: FieldRef<"MonthlySalesReport", 'Int'>
    readonly totalCompletedOrders: FieldRef<"MonthlySalesReport", 'Int'>
    readonly totalCancelledOrders: FieldRef<"MonthlySalesReport", 'Int'>
    readonly totalRevenue: FieldRef<"MonthlySalesReport", 'Decimal'>
    readonly totalItemsSold: FieldRef<"MonthlySalesReport", 'Int'>
    readonly averageOrderValue: FieldRef<"MonthlySalesReport", 'Decimal'>
    readonly newCustomers: FieldRef<"MonthlySalesReport", 'Int'>
    readonly newSellers: FieldRef<"MonthlySalesReport", 'Int'>
    readonly createdAt: FieldRef<"MonthlySalesReport", 'DateTime'>
    readonly updatedAt: FieldRef<"MonthlySalesReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MonthlySalesReport findUnique
   */
  export type MonthlySalesReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which MonthlySalesReport to fetch.
     */
    where: MonthlySalesReportWhereUniqueInput
  }

  /**
   * MonthlySalesReport findUniqueOrThrow
   */
  export type MonthlySalesReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which MonthlySalesReport to fetch.
     */
    where: MonthlySalesReportWhereUniqueInput
  }

  /**
   * MonthlySalesReport findFirst
   */
  export type MonthlySalesReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which MonthlySalesReport to fetch.
     */
    where?: MonthlySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlySalesReports to fetch.
     */
    orderBy?: MonthlySalesReportOrderByWithRelationInput | MonthlySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MonthlySalesReports.
     */
    cursor?: MonthlySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlySalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MonthlySalesReports.
     */
    distinct?: MonthlySalesReportScalarFieldEnum | MonthlySalesReportScalarFieldEnum[]
  }

  /**
   * MonthlySalesReport findFirstOrThrow
   */
  export type MonthlySalesReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which MonthlySalesReport to fetch.
     */
    where?: MonthlySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlySalesReports to fetch.
     */
    orderBy?: MonthlySalesReportOrderByWithRelationInput | MonthlySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MonthlySalesReports.
     */
    cursor?: MonthlySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlySalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MonthlySalesReports.
     */
    distinct?: MonthlySalesReportScalarFieldEnum | MonthlySalesReportScalarFieldEnum[]
  }

  /**
   * MonthlySalesReport findMany
   */
  export type MonthlySalesReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * Filter, which MonthlySalesReports to fetch.
     */
    where?: MonthlySalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlySalesReports to fetch.
     */
    orderBy?: MonthlySalesReportOrderByWithRelationInput | MonthlySalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MonthlySalesReports.
     */
    cursor?: MonthlySalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlySalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlySalesReports.
     */
    skip?: number
    distinct?: MonthlySalesReportScalarFieldEnum | MonthlySalesReportScalarFieldEnum[]
  }

  /**
   * MonthlySalesReport create
   */
  export type MonthlySalesReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * The data needed to create a MonthlySalesReport.
     */
    data: XOR<MonthlySalesReportCreateInput, MonthlySalesReportUncheckedCreateInput>
  }

  /**
   * MonthlySalesReport createMany
   */
  export type MonthlySalesReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MonthlySalesReports.
     */
    data: MonthlySalesReportCreateManyInput | MonthlySalesReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MonthlySalesReport createManyAndReturn
   */
  export type MonthlySalesReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MonthlySalesReports.
     */
    data: MonthlySalesReportCreateManyInput | MonthlySalesReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MonthlySalesReport update
   */
  export type MonthlySalesReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * The data needed to update a MonthlySalesReport.
     */
    data: XOR<MonthlySalesReportUpdateInput, MonthlySalesReportUncheckedUpdateInput>
    /**
     * Choose, which MonthlySalesReport to update.
     */
    where: MonthlySalesReportWhereUniqueInput
  }

  /**
   * MonthlySalesReport updateMany
   */
  export type MonthlySalesReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MonthlySalesReports.
     */
    data: XOR<MonthlySalesReportUpdateManyMutationInput, MonthlySalesReportUncheckedUpdateManyInput>
    /**
     * Filter which MonthlySalesReports to update
     */
    where?: MonthlySalesReportWhereInput
  }

  /**
   * MonthlySalesReport upsert
   */
  export type MonthlySalesReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * The filter to search for the MonthlySalesReport to update in case it exists.
     */
    where: MonthlySalesReportWhereUniqueInput
    /**
     * In case the MonthlySalesReport found by the `where` argument doesn't exist, create a new MonthlySalesReport with this data.
     */
    create: XOR<MonthlySalesReportCreateInput, MonthlySalesReportUncheckedCreateInput>
    /**
     * In case the MonthlySalesReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MonthlySalesReportUpdateInput, MonthlySalesReportUncheckedUpdateInput>
  }

  /**
   * MonthlySalesReport delete
   */
  export type MonthlySalesReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
    /**
     * Filter which MonthlySalesReport to delete.
     */
    where: MonthlySalesReportWhereUniqueInput
  }

  /**
   * MonthlySalesReport deleteMany
   */
  export type MonthlySalesReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MonthlySalesReports to delete
     */
    where?: MonthlySalesReportWhereInput
  }

  /**
   * MonthlySalesReport without action
   */
  export type MonthlySalesReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlySalesReport
     */
    select?: MonthlySalesReportSelect<ExtArgs> | null
  }


  /**
   * Model ProductSalesReport
   */

  export type AggregateProductSalesReport = {
    _count: ProductSalesReportCountAggregateOutputType | null
    _avg: ProductSalesReportAvgAggregateOutputType | null
    _sum: ProductSalesReportSumAggregateOutputType | null
    _min: ProductSalesReportMinAggregateOutputType | null
    _max: ProductSalesReportMaxAggregateOutputType | null
  }

  export type ProductSalesReportAvgAggregateOutputType = {
    totalUnitsSold: number | null
    totalRevenue: Decimal | null
    totalOrders: number | null
    averageRating: number | null
  }

  export type ProductSalesReportSumAggregateOutputType = {
    totalUnitsSold: number | null
    totalRevenue: Decimal | null
    totalOrders: number | null
    averageRating: number | null
  }

  export type ProductSalesReportMinAggregateOutputType = {
    id: string | null
    productId: string | null
    productName: string | null
    sellerId: string | null
    sellerName: string | null
    categoryId: string | null
    categoryName: string | null
    totalUnitsSold: number | null
    totalRevenue: Decimal | null
    totalOrders: number | null
    averageRating: number | null
    periodType: string | null
    periodDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductSalesReportMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    productName: string | null
    sellerId: string | null
    sellerName: string | null
    categoryId: string | null
    categoryName: string | null
    totalUnitsSold: number | null
    totalRevenue: Decimal | null
    totalOrders: number | null
    averageRating: number | null
    periodType: string | null
    periodDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductSalesReportCountAggregateOutputType = {
    id: number
    productId: number
    productName: number
    sellerId: number
    sellerName: number
    categoryId: number
    categoryName: number
    totalUnitsSold: number
    totalRevenue: number
    totalOrders: number
    averageRating: number
    periodType: number
    periodDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductSalesReportAvgAggregateInputType = {
    totalUnitsSold?: true
    totalRevenue?: true
    totalOrders?: true
    averageRating?: true
  }

  export type ProductSalesReportSumAggregateInputType = {
    totalUnitsSold?: true
    totalRevenue?: true
    totalOrders?: true
    averageRating?: true
  }

  export type ProductSalesReportMinAggregateInputType = {
    id?: true
    productId?: true
    productName?: true
    sellerId?: true
    sellerName?: true
    categoryId?: true
    categoryName?: true
    totalUnitsSold?: true
    totalRevenue?: true
    totalOrders?: true
    averageRating?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductSalesReportMaxAggregateInputType = {
    id?: true
    productId?: true
    productName?: true
    sellerId?: true
    sellerName?: true
    categoryId?: true
    categoryName?: true
    totalUnitsSold?: true
    totalRevenue?: true
    totalOrders?: true
    averageRating?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductSalesReportCountAggregateInputType = {
    id?: true
    productId?: true
    productName?: true
    sellerId?: true
    sellerName?: true
    categoryId?: true
    categoryName?: true
    totalUnitsSold?: true
    totalRevenue?: true
    totalOrders?: true
    averageRating?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductSalesReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductSalesReport to aggregate.
     */
    where?: ProductSalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductSalesReports to fetch.
     */
    orderBy?: ProductSalesReportOrderByWithRelationInput | ProductSalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductSalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductSalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductSalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductSalesReports
    **/
    _count?: true | ProductSalesReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductSalesReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSalesReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductSalesReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductSalesReportMaxAggregateInputType
  }

  export type GetProductSalesReportAggregateType<T extends ProductSalesReportAggregateArgs> = {
        [P in keyof T & keyof AggregateProductSalesReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductSalesReport[P]>
      : GetScalarType<T[P], AggregateProductSalesReport[P]>
  }




  export type ProductSalesReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductSalesReportWhereInput
    orderBy?: ProductSalesReportOrderByWithAggregationInput | ProductSalesReportOrderByWithAggregationInput[]
    by: ProductSalesReportScalarFieldEnum[] | ProductSalesReportScalarFieldEnum
    having?: ProductSalesReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductSalesReportCountAggregateInputType | true
    _avg?: ProductSalesReportAvgAggregateInputType
    _sum?: ProductSalesReportSumAggregateInputType
    _min?: ProductSalesReportMinAggregateInputType
    _max?: ProductSalesReportMaxAggregateInputType
  }

  export type ProductSalesReportGroupByOutputType = {
    id: string
    productId: string
    productName: string
    sellerId: string
    sellerName: string
    categoryId: string | null
    categoryName: string | null
    totalUnitsSold: number
    totalRevenue: Decimal
    totalOrders: number
    averageRating: number
    periodType: string
    periodDate: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ProductSalesReportCountAggregateOutputType | null
    _avg: ProductSalesReportAvgAggregateOutputType | null
    _sum: ProductSalesReportSumAggregateOutputType | null
    _min: ProductSalesReportMinAggregateOutputType | null
    _max: ProductSalesReportMaxAggregateOutputType | null
  }

  type GetProductSalesReportGroupByPayload<T extends ProductSalesReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductSalesReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductSalesReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductSalesReportGroupByOutputType[P]>
            : GetScalarType<T[P], ProductSalesReportGroupByOutputType[P]>
        }
      >
    >


  export type ProductSalesReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    productName?: boolean
    sellerId?: boolean
    sellerName?: boolean
    categoryId?: boolean
    categoryName?: boolean
    totalUnitsSold?: boolean
    totalRevenue?: boolean
    totalOrders?: boolean
    averageRating?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productSalesReport"]>

  export type ProductSalesReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    productName?: boolean
    sellerId?: boolean
    sellerName?: boolean
    categoryId?: boolean
    categoryName?: boolean
    totalUnitsSold?: boolean
    totalRevenue?: boolean
    totalOrders?: boolean
    averageRating?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productSalesReport"]>

  export type ProductSalesReportSelectScalar = {
    id?: boolean
    productId?: boolean
    productName?: boolean
    sellerId?: boolean
    sellerName?: boolean
    categoryId?: boolean
    categoryName?: boolean
    totalUnitsSold?: boolean
    totalRevenue?: boolean
    totalOrders?: boolean
    averageRating?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $ProductSalesReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductSalesReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      productName: string
      sellerId: string
      sellerName: string
      categoryId: string | null
      categoryName: string | null
      totalUnitsSold: number
      totalRevenue: Prisma.Decimal
      totalOrders: number
      averageRating: number
      periodType: string
      periodDate: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["productSalesReport"]>
    composites: {}
  }

  type ProductSalesReportGetPayload<S extends boolean | null | undefined | ProductSalesReportDefaultArgs> = $Result.GetResult<Prisma.$ProductSalesReportPayload, S>

  type ProductSalesReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductSalesReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductSalesReportCountAggregateInputType | true
    }

  export interface ProductSalesReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductSalesReport'], meta: { name: 'ProductSalesReport' } }
    /**
     * Find zero or one ProductSalesReport that matches the filter.
     * @param {ProductSalesReportFindUniqueArgs} args - Arguments to find a ProductSalesReport
     * @example
     * // Get one ProductSalesReport
     * const productSalesReport = await prisma.productSalesReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductSalesReportFindUniqueArgs>(args: SelectSubset<T, ProductSalesReportFindUniqueArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductSalesReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductSalesReportFindUniqueOrThrowArgs} args - Arguments to find a ProductSalesReport
     * @example
     * // Get one ProductSalesReport
     * const productSalesReport = await prisma.productSalesReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductSalesReportFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductSalesReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductSalesReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportFindFirstArgs} args - Arguments to find a ProductSalesReport
     * @example
     * // Get one ProductSalesReport
     * const productSalesReport = await prisma.productSalesReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductSalesReportFindFirstArgs>(args?: SelectSubset<T, ProductSalesReportFindFirstArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductSalesReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportFindFirstOrThrowArgs} args - Arguments to find a ProductSalesReport
     * @example
     * // Get one ProductSalesReport
     * const productSalesReport = await prisma.productSalesReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductSalesReportFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductSalesReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductSalesReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductSalesReports
     * const productSalesReports = await prisma.productSalesReport.findMany()
     * 
     * // Get first 10 ProductSalesReports
     * const productSalesReports = await prisma.productSalesReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productSalesReportWithIdOnly = await prisma.productSalesReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductSalesReportFindManyArgs>(args?: SelectSubset<T, ProductSalesReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductSalesReport.
     * @param {ProductSalesReportCreateArgs} args - Arguments to create a ProductSalesReport.
     * @example
     * // Create one ProductSalesReport
     * const ProductSalesReport = await prisma.productSalesReport.create({
     *   data: {
     *     // ... data to create a ProductSalesReport
     *   }
     * })
     * 
     */
    create<T extends ProductSalesReportCreateArgs>(args: SelectSubset<T, ProductSalesReportCreateArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductSalesReports.
     * @param {ProductSalesReportCreateManyArgs} args - Arguments to create many ProductSalesReports.
     * @example
     * // Create many ProductSalesReports
     * const productSalesReport = await prisma.productSalesReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductSalesReportCreateManyArgs>(args?: SelectSubset<T, ProductSalesReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProductSalesReports and returns the data saved in the database.
     * @param {ProductSalesReportCreateManyAndReturnArgs} args - Arguments to create many ProductSalesReports.
     * @example
     * // Create many ProductSalesReports
     * const productSalesReport = await prisma.productSalesReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProductSalesReports and only return the `id`
     * const productSalesReportWithIdOnly = await prisma.productSalesReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductSalesReportCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductSalesReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProductSalesReport.
     * @param {ProductSalesReportDeleteArgs} args - Arguments to delete one ProductSalesReport.
     * @example
     * // Delete one ProductSalesReport
     * const ProductSalesReport = await prisma.productSalesReport.delete({
     *   where: {
     *     // ... filter to delete one ProductSalesReport
     *   }
     * })
     * 
     */
    delete<T extends ProductSalesReportDeleteArgs>(args: SelectSubset<T, ProductSalesReportDeleteArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductSalesReport.
     * @param {ProductSalesReportUpdateArgs} args - Arguments to update one ProductSalesReport.
     * @example
     * // Update one ProductSalesReport
     * const productSalesReport = await prisma.productSalesReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductSalesReportUpdateArgs>(args: SelectSubset<T, ProductSalesReportUpdateArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductSalesReports.
     * @param {ProductSalesReportDeleteManyArgs} args - Arguments to filter ProductSalesReports to delete.
     * @example
     * // Delete a few ProductSalesReports
     * const { count } = await prisma.productSalesReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductSalesReportDeleteManyArgs>(args?: SelectSubset<T, ProductSalesReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductSalesReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductSalesReports
     * const productSalesReport = await prisma.productSalesReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductSalesReportUpdateManyArgs>(args: SelectSubset<T, ProductSalesReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductSalesReport.
     * @param {ProductSalesReportUpsertArgs} args - Arguments to update or create a ProductSalesReport.
     * @example
     * // Update or create a ProductSalesReport
     * const productSalesReport = await prisma.productSalesReport.upsert({
     *   create: {
     *     // ... data to create a ProductSalesReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductSalesReport we want to update
     *   }
     * })
     */
    upsert<T extends ProductSalesReportUpsertArgs>(args: SelectSubset<T, ProductSalesReportUpsertArgs<ExtArgs>>): Prisma__ProductSalesReportClient<$Result.GetResult<Prisma.$ProductSalesReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductSalesReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportCountArgs} args - Arguments to filter ProductSalesReports to count.
     * @example
     * // Count the number of ProductSalesReports
     * const count = await prisma.productSalesReport.count({
     *   where: {
     *     // ... the filter for the ProductSalesReports we want to count
     *   }
     * })
    **/
    count<T extends ProductSalesReportCountArgs>(
      args?: Subset<T, ProductSalesReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductSalesReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductSalesReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductSalesReportAggregateArgs>(args: Subset<T, ProductSalesReportAggregateArgs>): Prisma.PrismaPromise<GetProductSalesReportAggregateType<T>>

    /**
     * Group by ProductSalesReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductSalesReportGroupByArgs} args - Group by arguments.
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
      T extends ProductSalesReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductSalesReportGroupByArgs['orderBy'] }
        : { orderBy?: ProductSalesReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductSalesReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductSalesReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductSalesReport model
   */
  readonly fields: ProductSalesReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductSalesReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductSalesReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProductSalesReport model
   */ 
  interface ProductSalesReportFieldRefs {
    readonly id: FieldRef<"ProductSalesReport", 'String'>
    readonly productId: FieldRef<"ProductSalesReport", 'String'>
    readonly productName: FieldRef<"ProductSalesReport", 'String'>
    readonly sellerId: FieldRef<"ProductSalesReport", 'String'>
    readonly sellerName: FieldRef<"ProductSalesReport", 'String'>
    readonly categoryId: FieldRef<"ProductSalesReport", 'String'>
    readonly categoryName: FieldRef<"ProductSalesReport", 'String'>
    readonly totalUnitsSold: FieldRef<"ProductSalesReport", 'Int'>
    readonly totalRevenue: FieldRef<"ProductSalesReport", 'Decimal'>
    readonly totalOrders: FieldRef<"ProductSalesReport", 'Int'>
    readonly averageRating: FieldRef<"ProductSalesReport", 'Float'>
    readonly periodType: FieldRef<"ProductSalesReport", 'String'>
    readonly periodDate: FieldRef<"ProductSalesReport", 'DateTime'>
    readonly createdAt: FieldRef<"ProductSalesReport", 'DateTime'>
    readonly updatedAt: FieldRef<"ProductSalesReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProductSalesReport findUnique
   */
  export type ProductSalesReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * Filter, which ProductSalesReport to fetch.
     */
    where: ProductSalesReportWhereUniqueInput
  }

  /**
   * ProductSalesReport findUniqueOrThrow
   */
  export type ProductSalesReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * Filter, which ProductSalesReport to fetch.
     */
    where: ProductSalesReportWhereUniqueInput
  }

  /**
   * ProductSalesReport findFirst
   */
  export type ProductSalesReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * Filter, which ProductSalesReport to fetch.
     */
    where?: ProductSalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductSalesReports to fetch.
     */
    orderBy?: ProductSalesReportOrderByWithRelationInput | ProductSalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductSalesReports.
     */
    cursor?: ProductSalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductSalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductSalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductSalesReports.
     */
    distinct?: ProductSalesReportScalarFieldEnum | ProductSalesReportScalarFieldEnum[]
  }

  /**
   * ProductSalesReport findFirstOrThrow
   */
  export type ProductSalesReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * Filter, which ProductSalesReport to fetch.
     */
    where?: ProductSalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductSalesReports to fetch.
     */
    orderBy?: ProductSalesReportOrderByWithRelationInput | ProductSalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductSalesReports.
     */
    cursor?: ProductSalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductSalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductSalesReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductSalesReports.
     */
    distinct?: ProductSalesReportScalarFieldEnum | ProductSalesReportScalarFieldEnum[]
  }

  /**
   * ProductSalesReport findMany
   */
  export type ProductSalesReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * Filter, which ProductSalesReports to fetch.
     */
    where?: ProductSalesReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductSalesReports to fetch.
     */
    orderBy?: ProductSalesReportOrderByWithRelationInput | ProductSalesReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductSalesReports.
     */
    cursor?: ProductSalesReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductSalesReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductSalesReports.
     */
    skip?: number
    distinct?: ProductSalesReportScalarFieldEnum | ProductSalesReportScalarFieldEnum[]
  }

  /**
   * ProductSalesReport create
   */
  export type ProductSalesReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * The data needed to create a ProductSalesReport.
     */
    data: XOR<ProductSalesReportCreateInput, ProductSalesReportUncheckedCreateInput>
  }

  /**
   * ProductSalesReport createMany
   */
  export type ProductSalesReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductSalesReports.
     */
    data: ProductSalesReportCreateManyInput | ProductSalesReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductSalesReport createManyAndReturn
   */
  export type ProductSalesReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProductSalesReports.
     */
    data: ProductSalesReportCreateManyInput | ProductSalesReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductSalesReport update
   */
  export type ProductSalesReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * The data needed to update a ProductSalesReport.
     */
    data: XOR<ProductSalesReportUpdateInput, ProductSalesReportUncheckedUpdateInput>
    /**
     * Choose, which ProductSalesReport to update.
     */
    where: ProductSalesReportWhereUniqueInput
  }

  /**
   * ProductSalesReport updateMany
   */
  export type ProductSalesReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductSalesReports.
     */
    data: XOR<ProductSalesReportUpdateManyMutationInput, ProductSalesReportUncheckedUpdateManyInput>
    /**
     * Filter which ProductSalesReports to update
     */
    where?: ProductSalesReportWhereInput
  }

  /**
   * ProductSalesReport upsert
   */
  export type ProductSalesReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * The filter to search for the ProductSalesReport to update in case it exists.
     */
    where: ProductSalesReportWhereUniqueInput
    /**
     * In case the ProductSalesReport found by the `where` argument doesn't exist, create a new ProductSalesReport with this data.
     */
    create: XOR<ProductSalesReportCreateInput, ProductSalesReportUncheckedCreateInput>
    /**
     * In case the ProductSalesReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductSalesReportUpdateInput, ProductSalesReportUncheckedUpdateInput>
  }

  /**
   * ProductSalesReport delete
   */
  export type ProductSalesReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
    /**
     * Filter which ProductSalesReport to delete.
     */
    where: ProductSalesReportWhereUniqueInput
  }

  /**
   * ProductSalesReport deleteMany
   */
  export type ProductSalesReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductSalesReports to delete
     */
    where?: ProductSalesReportWhereInput
  }

  /**
   * ProductSalesReport without action
   */
  export type ProductSalesReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductSalesReport
     */
    select?: ProductSalesReportSelect<ExtArgs> | null
  }


  /**
   * Model SellerPerformanceReport
   */

  export type AggregateSellerPerformanceReport = {
    _count: SellerPerformanceReportCountAggregateOutputType | null
    _avg: SellerPerformanceReportAvgAggregateOutputType | null
    _sum: SellerPerformanceReportSumAggregateOutputType | null
    _min: SellerPerformanceReportMinAggregateOutputType | null
    _max: SellerPerformanceReportMaxAggregateOutputType | null
  }

  export type SellerPerformanceReportAvgAggregateOutputType = {
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    totalCancelled: number | null
    averageRating: number | null
    totalReviews: number | null
    cancellationRate: number | null
  }

  export type SellerPerformanceReportSumAggregateOutputType = {
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    totalCancelled: number | null
    averageRating: number | null
    totalReviews: number | null
    cancellationRate: number | null
  }

  export type SellerPerformanceReportMinAggregateOutputType = {
    id: string | null
    sellerId: string | null
    sellerName: string | null
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    totalCancelled: number | null
    averageRating: number | null
    totalReviews: number | null
    cancellationRate: number | null
    periodType: string | null
    periodDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SellerPerformanceReportMaxAggregateOutputType = {
    id: string | null
    sellerId: string | null
    sellerName: string | null
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    totalCancelled: number | null
    averageRating: number | null
    totalReviews: number | null
    cancellationRate: number | null
    periodType: string | null
    periodDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SellerPerformanceReportCountAggregateOutputType = {
    id: number
    sellerId: number
    sellerName: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    totalItemsSold: number
    totalCancelled: number
    averageRating: number
    totalReviews: number
    cancellationRate: number
    periodType: number
    periodDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SellerPerformanceReportAvgAggregateInputType = {
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    totalCancelled?: true
    averageRating?: true
    totalReviews?: true
    cancellationRate?: true
  }

  export type SellerPerformanceReportSumAggregateInputType = {
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    totalCancelled?: true
    averageRating?: true
    totalReviews?: true
    cancellationRate?: true
  }

  export type SellerPerformanceReportMinAggregateInputType = {
    id?: true
    sellerId?: true
    sellerName?: true
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    totalCancelled?: true
    averageRating?: true
    totalReviews?: true
    cancellationRate?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SellerPerformanceReportMaxAggregateInputType = {
    id?: true
    sellerId?: true
    sellerName?: true
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    totalCancelled?: true
    averageRating?: true
    totalReviews?: true
    cancellationRate?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SellerPerformanceReportCountAggregateInputType = {
    id?: true
    sellerId?: true
    sellerName?: true
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    totalCancelled?: true
    averageRating?: true
    totalReviews?: true
    cancellationRate?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SellerPerformanceReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SellerPerformanceReport to aggregate.
     */
    where?: SellerPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SellerPerformanceReports to fetch.
     */
    orderBy?: SellerPerformanceReportOrderByWithRelationInput | SellerPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SellerPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SellerPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SellerPerformanceReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SellerPerformanceReports
    **/
    _count?: true | SellerPerformanceReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SellerPerformanceReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SellerPerformanceReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SellerPerformanceReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SellerPerformanceReportMaxAggregateInputType
  }

  export type GetSellerPerformanceReportAggregateType<T extends SellerPerformanceReportAggregateArgs> = {
        [P in keyof T & keyof AggregateSellerPerformanceReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSellerPerformanceReport[P]>
      : GetScalarType<T[P], AggregateSellerPerformanceReport[P]>
  }




  export type SellerPerformanceReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SellerPerformanceReportWhereInput
    orderBy?: SellerPerformanceReportOrderByWithAggregationInput | SellerPerformanceReportOrderByWithAggregationInput[]
    by: SellerPerformanceReportScalarFieldEnum[] | SellerPerformanceReportScalarFieldEnum
    having?: SellerPerformanceReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SellerPerformanceReportCountAggregateInputType | true
    _avg?: SellerPerformanceReportAvgAggregateInputType
    _sum?: SellerPerformanceReportSumAggregateInputType
    _min?: SellerPerformanceReportMinAggregateInputType
    _max?: SellerPerformanceReportMaxAggregateInputType
  }

  export type SellerPerformanceReportGroupByOutputType = {
    id: string
    sellerId: string
    sellerName: string
    totalProducts: number
    totalOrders: number
    totalRevenue: Decimal
    totalItemsSold: number
    totalCancelled: number
    averageRating: number
    totalReviews: number
    cancellationRate: number
    periodType: string
    periodDate: Date | null
    createdAt: Date
    updatedAt: Date
    _count: SellerPerformanceReportCountAggregateOutputType | null
    _avg: SellerPerformanceReportAvgAggregateOutputType | null
    _sum: SellerPerformanceReportSumAggregateOutputType | null
    _min: SellerPerformanceReportMinAggregateOutputType | null
    _max: SellerPerformanceReportMaxAggregateOutputType | null
  }

  type GetSellerPerformanceReportGroupByPayload<T extends SellerPerformanceReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SellerPerformanceReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SellerPerformanceReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SellerPerformanceReportGroupByOutputType[P]>
            : GetScalarType<T[P], SellerPerformanceReportGroupByOutputType[P]>
        }
      >
    >


  export type SellerPerformanceReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sellerId?: boolean
    sellerName?: boolean
    totalProducts?: boolean
    totalOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    totalCancelled?: boolean
    averageRating?: boolean
    totalReviews?: boolean
    cancellationRate?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sellerPerformanceReport"]>

  export type SellerPerformanceReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sellerId?: boolean
    sellerName?: boolean
    totalProducts?: boolean
    totalOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    totalCancelled?: boolean
    averageRating?: boolean
    totalReviews?: boolean
    cancellationRate?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sellerPerformanceReport"]>

  export type SellerPerformanceReportSelectScalar = {
    id?: boolean
    sellerId?: boolean
    sellerName?: boolean
    totalProducts?: boolean
    totalOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    totalCancelled?: boolean
    averageRating?: boolean
    totalReviews?: boolean
    cancellationRate?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $SellerPerformanceReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SellerPerformanceReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sellerId: string
      sellerName: string
      totalProducts: number
      totalOrders: number
      totalRevenue: Prisma.Decimal
      totalItemsSold: number
      totalCancelled: number
      averageRating: number
      totalReviews: number
      cancellationRate: number
      periodType: string
      periodDate: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sellerPerformanceReport"]>
    composites: {}
  }

  type SellerPerformanceReportGetPayload<S extends boolean | null | undefined | SellerPerformanceReportDefaultArgs> = $Result.GetResult<Prisma.$SellerPerformanceReportPayload, S>

  type SellerPerformanceReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SellerPerformanceReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SellerPerformanceReportCountAggregateInputType | true
    }

  export interface SellerPerformanceReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SellerPerformanceReport'], meta: { name: 'SellerPerformanceReport' } }
    /**
     * Find zero or one SellerPerformanceReport that matches the filter.
     * @param {SellerPerformanceReportFindUniqueArgs} args - Arguments to find a SellerPerformanceReport
     * @example
     * // Get one SellerPerformanceReport
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SellerPerformanceReportFindUniqueArgs>(args: SelectSubset<T, SellerPerformanceReportFindUniqueArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SellerPerformanceReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SellerPerformanceReportFindUniqueOrThrowArgs} args - Arguments to find a SellerPerformanceReport
     * @example
     * // Get one SellerPerformanceReport
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SellerPerformanceReportFindUniqueOrThrowArgs>(args: SelectSubset<T, SellerPerformanceReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SellerPerformanceReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportFindFirstArgs} args - Arguments to find a SellerPerformanceReport
     * @example
     * // Get one SellerPerformanceReport
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SellerPerformanceReportFindFirstArgs>(args?: SelectSubset<T, SellerPerformanceReportFindFirstArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SellerPerformanceReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportFindFirstOrThrowArgs} args - Arguments to find a SellerPerformanceReport
     * @example
     * // Get one SellerPerformanceReport
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SellerPerformanceReportFindFirstOrThrowArgs>(args?: SelectSubset<T, SellerPerformanceReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SellerPerformanceReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SellerPerformanceReports
     * const sellerPerformanceReports = await prisma.sellerPerformanceReport.findMany()
     * 
     * // Get first 10 SellerPerformanceReports
     * const sellerPerformanceReports = await prisma.sellerPerformanceReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sellerPerformanceReportWithIdOnly = await prisma.sellerPerformanceReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SellerPerformanceReportFindManyArgs>(args?: SelectSubset<T, SellerPerformanceReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SellerPerformanceReport.
     * @param {SellerPerformanceReportCreateArgs} args - Arguments to create a SellerPerformanceReport.
     * @example
     * // Create one SellerPerformanceReport
     * const SellerPerformanceReport = await prisma.sellerPerformanceReport.create({
     *   data: {
     *     // ... data to create a SellerPerformanceReport
     *   }
     * })
     * 
     */
    create<T extends SellerPerformanceReportCreateArgs>(args: SelectSubset<T, SellerPerformanceReportCreateArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SellerPerformanceReports.
     * @param {SellerPerformanceReportCreateManyArgs} args - Arguments to create many SellerPerformanceReports.
     * @example
     * // Create many SellerPerformanceReports
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SellerPerformanceReportCreateManyArgs>(args?: SelectSubset<T, SellerPerformanceReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SellerPerformanceReports and returns the data saved in the database.
     * @param {SellerPerformanceReportCreateManyAndReturnArgs} args - Arguments to create many SellerPerformanceReports.
     * @example
     * // Create many SellerPerformanceReports
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SellerPerformanceReports and only return the `id`
     * const sellerPerformanceReportWithIdOnly = await prisma.sellerPerformanceReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SellerPerformanceReportCreateManyAndReturnArgs>(args?: SelectSubset<T, SellerPerformanceReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SellerPerformanceReport.
     * @param {SellerPerformanceReportDeleteArgs} args - Arguments to delete one SellerPerformanceReport.
     * @example
     * // Delete one SellerPerformanceReport
     * const SellerPerformanceReport = await prisma.sellerPerformanceReport.delete({
     *   where: {
     *     // ... filter to delete one SellerPerformanceReport
     *   }
     * })
     * 
     */
    delete<T extends SellerPerformanceReportDeleteArgs>(args: SelectSubset<T, SellerPerformanceReportDeleteArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SellerPerformanceReport.
     * @param {SellerPerformanceReportUpdateArgs} args - Arguments to update one SellerPerformanceReport.
     * @example
     * // Update one SellerPerformanceReport
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SellerPerformanceReportUpdateArgs>(args: SelectSubset<T, SellerPerformanceReportUpdateArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SellerPerformanceReports.
     * @param {SellerPerformanceReportDeleteManyArgs} args - Arguments to filter SellerPerformanceReports to delete.
     * @example
     * // Delete a few SellerPerformanceReports
     * const { count } = await prisma.sellerPerformanceReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SellerPerformanceReportDeleteManyArgs>(args?: SelectSubset<T, SellerPerformanceReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SellerPerformanceReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SellerPerformanceReports
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SellerPerformanceReportUpdateManyArgs>(args: SelectSubset<T, SellerPerformanceReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SellerPerformanceReport.
     * @param {SellerPerformanceReportUpsertArgs} args - Arguments to update or create a SellerPerformanceReport.
     * @example
     * // Update or create a SellerPerformanceReport
     * const sellerPerformanceReport = await prisma.sellerPerformanceReport.upsert({
     *   create: {
     *     // ... data to create a SellerPerformanceReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SellerPerformanceReport we want to update
     *   }
     * })
     */
    upsert<T extends SellerPerformanceReportUpsertArgs>(args: SelectSubset<T, SellerPerformanceReportUpsertArgs<ExtArgs>>): Prisma__SellerPerformanceReportClient<$Result.GetResult<Prisma.$SellerPerformanceReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SellerPerformanceReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportCountArgs} args - Arguments to filter SellerPerformanceReports to count.
     * @example
     * // Count the number of SellerPerformanceReports
     * const count = await prisma.sellerPerformanceReport.count({
     *   where: {
     *     // ... the filter for the SellerPerformanceReports we want to count
     *   }
     * })
    **/
    count<T extends SellerPerformanceReportCountArgs>(
      args?: Subset<T, SellerPerformanceReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SellerPerformanceReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SellerPerformanceReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SellerPerformanceReportAggregateArgs>(args: Subset<T, SellerPerformanceReportAggregateArgs>): Prisma.PrismaPromise<GetSellerPerformanceReportAggregateType<T>>

    /**
     * Group by SellerPerformanceReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SellerPerformanceReportGroupByArgs} args - Group by arguments.
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
      T extends SellerPerformanceReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SellerPerformanceReportGroupByArgs['orderBy'] }
        : { orderBy?: SellerPerformanceReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SellerPerformanceReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSellerPerformanceReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SellerPerformanceReport model
   */
  readonly fields: SellerPerformanceReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SellerPerformanceReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SellerPerformanceReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the SellerPerformanceReport model
   */ 
  interface SellerPerformanceReportFieldRefs {
    readonly id: FieldRef<"SellerPerformanceReport", 'String'>
    readonly sellerId: FieldRef<"SellerPerformanceReport", 'String'>
    readonly sellerName: FieldRef<"SellerPerformanceReport", 'String'>
    readonly totalProducts: FieldRef<"SellerPerformanceReport", 'Int'>
    readonly totalOrders: FieldRef<"SellerPerformanceReport", 'Int'>
    readonly totalRevenue: FieldRef<"SellerPerformanceReport", 'Decimal'>
    readonly totalItemsSold: FieldRef<"SellerPerformanceReport", 'Int'>
    readonly totalCancelled: FieldRef<"SellerPerformanceReport", 'Int'>
    readonly averageRating: FieldRef<"SellerPerformanceReport", 'Float'>
    readonly totalReviews: FieldRef<"SellerPerformanceReport", 'Int'>
    readonly cancellationRate: FieldRef<"SellerPerformanceReport", 'Float'>
    readonly periodType: FieldRef<"SellerPerformanceReport", 'String'>
    readonly periodDate: FieldRef<"SellerPerformanceReport", 'DateTime'>
    readonly createdAt: FieldRef<"SellerPerformanceReport", 'DateTime'>
    readonly updatedAt: FieldRef<"SellerPerformanceReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SellerPerformanceReport findUnique
   */
  export type SellerPerformanceReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which SellerPerformanceReport to fetch.
     */
    where: SellerPerformanceReportWhereUniqueInput
  }

  /**
   * SellerPerformanceReport findUniqueOrThrow
   */
  export type SellerPerformanceReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which SellerPerformanceReport to fetch.
     */
    where: SellerPerformanceReportWhereUniqueInput
  }

  /**
   * SellerPerformanceReport findFirst
   */
  export type SellerPerformanceReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which SellerPerformanceReport to fetch.
     */
    where?: SellerPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SellerPerformanceReports to fetch.
     */
    orderBy?: SellerPerformanceReportOrderByWithRelationInput | SellerPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SellerPerformanceReports.
     */
    cursor?: SellerPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SellerPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SellerPerformanceReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SellerPerformanceReports.
     */
    distinct?: SellerPerformanceReportScalarFieldEnum | SellerPerformanceReportScalarFieldEnum[]
  }

  /**
   * SellerPerformanceReport findFirstOrThrow
   */
  export type SellerPerformanceReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which SellerPerformanceReport to fetch.
     */
    where?: SellerPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SellerPerformanceReports to fetch.
     */
    orderBy?: SellerPerformanceReportOrderByWithRelationInput | SellerPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SellerPerformanceReports.
     */
    cursor?: SellerPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SellerPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SellerPerformanceReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SellerPerformanceReports.
     */
    distinct?: SellerPerformanceReportScalarFieldEnum | SellerPerformanceReportScalarFieldEnum[]
  }

  /**
   * SellerPerformanceReport findMany
   */
  export type SellerPerformanceReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which SellerPerformanceReports to fetch.
     */
    where?: SellerPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SellerPerformanceReports to fetch.
     */
    orderBy?: SellerPerformanceReportOrderByWithRelationInput | SellerPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SellerPerformanceReports.
     */
    cursor?: SellerPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SellerPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SellerPerformanceReports.
     */
    skip?: number
    distinct?: SellerPerformanceReportScalarFieldEnum | SellerPerformanceReportScalarFieldEnum[]
  }

  /**
   * SellerPerformanceReport create
   */
  export type SellerPerformanceReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * The data needed to create a SellerPerformanceReport.
     */
    data: XOR<SellerPerformanceReportCreateInput, SellerPerformanceReportUncheckedCreateInput>
  }

  /**
   * SellerPerformanceReport createMany
   */
  export type SellerPerformanceReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SellerPerformanceReports.
     */
    data: SellerPerformanceReportCreateManyInput | SellerPerformanceReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SellerPerformanceReport createManyAndReturn
   */
  export type SellerPerformanceReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SellerPerformanceReports.
     */
    data: SellerPerformanceReportCreateManyInput | SellerPerformanceReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SellerPerformanceReport update
   */
  export type SellerPerformanceReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * The data needed to update a SellerPerformanceReport.
     */
    data: XOR<SellerPerformanceReportUpdateInput, SellerPerformanceReportUncheckedUpdateInput>
    /**
     * Choose, which SellerPerformanceReport to update.
     */
    where: SellerPerformanceReportWhereUniqueInput
  }

  /**
   * SellerPerformanceReport updateMany
   */
  export type SellerPerformanceReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SellerPerformanceReports.
     */
    data: XOR<SellerPerformanceReportUpdateManyMutationInput, SellerPerformanceReportUncheckedUpdateManyInput>
    /**
     * Filter which SellerPerformanceReports to update
     */
    where?: SellerPerformanceReportWhereInput
  }

  /**
   * SellerPerformanceReport upsert
   */
  export type SellerPerformanceReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * The filter to search for the SellerPerformanceReport to update in case it exists.
     */
    where: SellerPerformanceReportWhereUniqueInput
    /**
     * In case the SellerPerformanceReport found by the `where` argument doesn't exist, create a new SellerPerformanceReport with this data.
     */
    create: XOR<SellerPerformanceReportCreateInput, SellerPerformanceReportUncheckedCreateInput>
    /**
     * In case the SellerPerformanceReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SellerPerformanceReportUpdateInput, SellerPerformanceReportUncheckedUpdateInput>
  }

  /**
   * SellerPerformanceReport delete
   */
  export type SellerPerformanceReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter which SellerPerformanceReport to delete.
     */
    where: SellerPerformanceReportWhereUniqueInput
  }

  /**
   * SellerPerformanceReport deleteMany
   */
  export type SellerPerformanceReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SellerPerformanceReports to delete
     */
    where?: SellerPerformanceReportWhereInput
  }

  /**
   * SellerPerformanceReport without action
   */
  export type SellerPerformanceReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SellerPerformanceReport
     */
    select?: SellerPerformanceReportSelect<ExtArgs> | null
  }


  /**
   * Model PaymentReport
   */

  export type AggregatePaymentReport = {
    _count: PaymentReportCountAggregateOutputType | null
    _avg: PaymentReportAvgAggregateOutputType | null
    _sum: PaymentReportSumAggregateOutputType | null
    _min: PaymentReportMinAggregateOutputType | null
    _max: PaymentReportMaxAggregateOutputType | null
  }

  export type PaymentReportAvgAggregateOutputType = {
    totalTransactions: number | null
    successCount: number | null
    failedCount: number | null
    expiredCount: number | null
    successRate: number | null
    totalAmount: Decimal | null
    averageAmount: Decimal | null
  }

  export type PaymentReportSumAggregateOutputType = {
    totalTransactions: number | null
    successCount: number | null
    failedCount: number | null
    expiredCount: number | null
    successRate: number | null
    totalAmount: Decimal | null
    averageAmount: Decimal | null
  }

  export type PaymentReportMinAggregateOutputType = {
    id: string | null
    date: Date | null
    totalTransactions: number | null
    successCount: number | null
    failedCount: number | null
    expiredCount: number | null
    successRate: number | null
    totalAmount: Decimal | null
    averageAmount: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentReportMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    totalTransactions: number | null
    successCount: number | null
    failedCount: number | null
    expiredCount: number | null
    successRate: number | null
    totalAmount: Decimal | null
    averageAmount: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentReportCountAggregateOutputType = {
    id: number
    date: number
    totalTransactions: number
    successCount: number
    failedCount: number
    expiredCount: number
    successRate: number
    totalAmount: number
    averageAmount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PaymentReportAvgAggregateInputType = {
    totalTransactions?: true
    successCount?: true
    failedCount?: true
    expiredCount?: true
    successRate?: true
    totalAmount?: true
    averageAmount?: true
  }

  export type PaymentReportSumAggregateInputType = {
    totalTransactions?: true
    successCount?: true
    failedCount?: true
    expiredCount?: true
    successRate?: true
    totalAmount?: true
    averageAmount?: true
  }

  export type PaymentReportMinAggregateInputType = {
    id?: true
    date?: true
    totalTransactions?: true
    successCount?: true
    failedCount?: true
    expiredCount?: true
    successRate?: true
    totalAmount?: true
    averageAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentReportMaxAggregateInputType = {
    id?: true
    date?: true
    totalTransactions?: true
    successCount?: true
    failedCount?: true
    expiredCount?: true
    successRate?: true
    totalAmount?: true
    averageAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentReportCountAggregateInputType = {
    id?: true
    date?: true
    totalTransactions?: true
    successCount?: true
    failedCount?: true
    expiredCount?: true
    successRate?: true
    totalAmount?: true
    averageAmount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PaymentReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PaymentReport to aggregate.
     */
    where?: PaymentReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaymentReports to fetch.
     */
    orderBy?: PaymentReportOrderByWithRelationInput | PaymentReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaymentReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaymentReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaymentReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PaymentReports
    **/
    _count?: true | PaymentReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaymentReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaymentReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaymentReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaymentReportMaxAggregateInputType
  }

  export type GetPaymentReportAggregateType<T extends PaymentReportAggregateArgs> = {
        [P in keyof T & keyof AggregatePaymentReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePaymentReport[P]>
      : GetScalarType<T[P], AggregatePaymentReport[P]>
  }




  export type PaymentReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentReportWhereInput
    orderBy?: PaymentReportOrderByWithAggregationInput | PaymentReportOrderByWithAggregationInput[]
    by: PaymentReportScalarFieldEnum[] | PaymentReportScalarFieldEnum
    having?: PaymentReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaymentReportCountAggregateInputType | true
    _avg?: PaymentReportAvgAggregateInputType
    _sum?: PaymentReportSumAggregateInputType
    _min?: PaymentReportMinAggregateInputType
    _max?: PaymentReportMaxAggregateInputType
  }

  export type PaymentReportGroupByOutputType = {
    id: string
    date: Date
    totalTransactions: number
    successCount: number
    failedCount: number
    expiredCount: number
    successRate: number
    totalAmount: Decimal
    averageAmount: Decimal
    createdAt: Date
    updatedAt: Date
    _count: PaymentReportCountAggregateOutputType | null
    _avg: PaymentReportAvgAggregateOutputType | null
    _sum: PaymentReportSumAggregateOutputType | null
    _min: PaymentReportMinAggregateOutputType | null
    _max: PaymentReportMaxAggregateOutputType | null
  }

  type GetPaymentReportGroupByPayload<T extends PaymentReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaymentReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaymentReportGroupByOutputType[P]>
            : GetScalarType<T[P], PaymentReportGroupByOutputType[P]>
        }
      >
    >


  export type PaymentReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalTransactions?: boolean
    successCount?: boolean
    failedCount?: boolean
    expiredCount?: boolean
    successRate?: boolean
    totalAmount?: boolean
    averageAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["paymentReport"]>

  export type PaymentReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalTransactions?: boolean
    successCount?: boolean
    failedCount?: boolean
    expiredCount?: boolean
    successRate?: boolean
    totalAmount?: boolean
    averageAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["paymentReport"]>

  export type PaymentReportSelectScalar = {
    id?: boolean
    date?: boolean
    totalTransactions?: boolean
    successCount?: boolean
    failedCount?: boolean
    expiredCount?: boolean
    successRate?: boolean
    totalAmount?: boolean
    averageAmount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $PaymentReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PaymentReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      totalTransactions: number
      successCount: number
      failedCount: number
      expiredCount: number
      successRate: number
      totalAmount: Prisma.Decimal
      averageAmount: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["paymentReport"]>
    composites: {}
  }

  type PaymentReportGetPayload<S extends boolean | null | undefined | PaymentReportDefaultArgs> = $Result.GetResult<Prisma.$PaymentReportPayload, S>

  type PaymentReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PaymentReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PaymentReportCountAggregateInputType | true
    }

  export interface PaymentReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PaymentReport'], meta: { name: 'PaymentReport' } }
    /**
     * Find zero or one PaymentReport that matches the filter.
     * @param {PaymentReportFindUniqueArgs} args - Arguments to find a PaymentReport
     * @example
     * // Get one PaymentReport
     * const paymentReport = await prisma.paymentReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentReportFindUniqueArgs>(args: SelectSubset<T, PaymentReportFindUniqueArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PaymentReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PaymentReportFindUniqueOrThrowArgs} args - Arguments to find a PaymentReport
     * @example
     * // Get one PaymentReport
     * const paymentReport = await prisma.paymentReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentReportFindUniqueOrThrowArgs>(args: SelectSubset<T, PaymentReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PaymentReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportFindFirstArgs} args - Arguments to find a PaymentReport
     * @example
     * // Get one PaymentReport
     * const paymentReport = await prisma.paymentReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentReportFindFirstArgs>(args?: SelectSubset<T, PaymentReportFindFirstArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PaymentReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportFindFirstOrThrowArgs} args - Arguments to find a PaymentReport
     * @example
     * // Get one PaymentReport
     * const paymentReport = await prisma.paymentReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentReportFindFirstOrThrowArgs>(args?: SelectSubset<T, PaymentReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PaymentReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PaymentReports
     * const paymentReports = await prisma.paymentReport.findMany()
     * 
     * // Get first 10 PaymentReports
     * const paymentReports = await prisma.paymentReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paymentReportWithIdOnly = await prisma.paymentReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaymentReportFindManyArgs>(args?: SelectSubset<T, PaymentReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PaymentReport.
     * @param {PaymentReportCreateArgs} args - Arguments to create a PaymentReport.
     * @example
     * // Create one PaymentReport
     * const PaymentReport = await prisma.paymentReport.create({
     *   data: {
     *     // ... data to create a PaymentReport
     *   }
     * })
     * 
     */
    create<T extends PaymentReportCreateArgs>(args: SelectSubset<T, PaymentReportCreateArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PaymentReports.
     * @param {PaymentReportCreateManyArgs} args - Arguments to create many PaymentReports.
     * @example
     * // Create many PaymentReports
     * const paymentReport = await prisma.paymentReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaymentReportCreateManyArgs>(args?: SelectSubset<T, PaymentReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PaymentReports and returns the data saved in the database.
     * @param {PaymentReportCreateManyAndReturnArgs} args - Arguments to create many PaymentReports.
     * @example
     * // Create many PaymentReports
     * const paymentReport = await prisma.paymentReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PaymentReports and only return the `id`
     * const paymentReportWithIdOnly = await prisma.paymentReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaymentReportCreateManyAndReturnArgs>(args?: SelectSubset<T, PaymentReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PaymentReport.
     * @param {PaymentReportDeleteArgs} args - Arguments to delete one PaymentReport.
     * @example
     * // Delete one PaymentReport
     * const PaymentReport = await prisma.paymentReport.delete({
     *   where: {
     *     // ... filter to delete one PaymentReport
     *   }
     * })
     * 
     */
    delete<T extends PaymentReportDeleteArgs>(args: SelectSubset<T, PaymentReportDeleteArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PaymentReport.
     * @param {PaymentReportUpdateArgs} args - Arguments to update one PaymentReport.
     * @example
     * // Update one PaymentReport
     * const paymentReport = await prisma.paymentReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaymentReportUpdateArgs>(args: SelectSubset<T, PaymentReportUpdateArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PaymentReports.
     * @param {PaymentReportDeleteManyArgs} args - Arguments to filter PaymentReports to delete.
     * @example
     * // Delete a few PaymentReports
     * const { count } = await prisma.paymentReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaymentReportDeleteManyArgs>(args?: SelectSubset<T, PaymentReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PaymentReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PaymentReports
     * const paymentReport = await prisma.paymentReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaymentReportUpdateManyArgs>(args: SelectSubset<T, PaymentReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PaymentReport.
     * @param {PaymentReportUpsertArgs} args - Arguments to update or create a PaymentReport.
     * @example
     * // Update or create a PaymentReport
     * const paymentReport = await prisma.paymentReport.upsert({
     *   create: {
     *     // ... data to create a PaymentReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PaymentReport we want to update
     *   }
     * })
     */
    upsert<T extends PaymentReportUpsertArgs>(args: SelectSubset<T, PaymentReportUpsertArgs<ExtArgs>>): Prisma__PaymentReportClient<$Result.GetResult<Prisma.$PaymentReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PaymentReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportCountArgs} args - Arguments to filter PaymentReports to count.
     * @example
     * // Count the number of PaymentReports
     * const count = await prisma.paymentReport.count({
     *   where: {
     *     // ... the filter for the PaymentReports we want to count
     *   }
     * })
    **/
    count<T extends PaymentReportCountArgs>(
      args?: Subset<T, PaymentReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaymentReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PaymentReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PaymentReportAggregateArgs>(args: Subset<T, PaymentReportAggregateArgs>): Prisma.PrismaPromise<GetPaymentReportAggregateType<T>>

    /**
     * Group by PaymentReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentReportGroupByArgs} args - Group by arguments.
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
      T extends PaymentReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaymentReportGroupByArgs['orderBy'] }
        : { orderBy?: PaymentReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PaymentReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaymentReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PaymentReport model
   */
  readonly fields: PaymentReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PaymentReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PaymentReport model
   */ 
  interface PaymentReportFieldRefs {
    readonly id: FieldRef<"PaymentReport", 'String'>
    readonly date: FieldRef<"PaymentReport", 'DateTime'>
    readonly totalTransactions: FieldRef<"PaymentReport", 'Int'>
    readonly successCount: FieldRef<"PaymentReport", 'Int'>
    readonly failedCount: FieldRef<"PaymentReport", 'Int'>
    readonly expiredCount: FieldRef<"PaymentReport", 'Int'>
    readonly successRate: FieldRef<"PaymentReport", 'Float'>
    readonly totalAmount: FieldRef<"PaymentReport", 'Decimal'>
    readonly averageAmount: FieldRef<"PaymentReport", 'Decimal'>
    readonly createdAt: FieldRef<"PaymentReport", 'DateTime'>
    readonly updatedAt: FieldRef<"PaymentReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PaymentReport findUnique
   */
  export type PaymentReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * Filter, which PaymentReport to fetch.
     */
    where: PaymentReportWhereUniqueInput
  }

  /**
   * PaymentReport findUniqueOrThrow
   */
  export type PaymentReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * Filter, which PaymentReport to fetch.
     */
    where: PaymentReportWhereUniqueInput
  }

  /**
   * PaymentReport findFirst
   */
  export type PaymentReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * Filter, which PaymentReport to fetch.
     */
    where?: PaymentReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaymentReports to fetch.
     */
    orderBy?: PaymentReportOrderByWithRelationInput | PaymentReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PaymentReports.
     */
    cursor?: PaymentReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaymentReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaymentReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PaymentReports.
     */
    distinct?: PaymentReportScalarFieldEnum | PaymentReportScalarFieldEnum[]
  }

  /**
   * PaymentReport findFirstOrThrow
   */
  export type PaymentReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * Filter, which PaymentReport to fetch.
     */
    where?: PaymentReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaymentReports to fetch.
     */
    orderBy?: PaymentReportOrderByWithRelationInput | PaymentReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PaymentReports.
     */
    cursor?: PaymentReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaymentReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaymentReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PaymentReports.
     */
    distinct?: PaymentReportScalarFieldEnum | PaymentReportScalarFieldEnum[]
  }

  /**
   * PaymentReport findMany
   */
  export type PaymentReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * Filter, which PaymentReports to fetch.
     */
    where?: PaymentReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaymentReports to fetch.
     */
    orderBy?: PaymentReportOrderByWithRelationInput | PaymentReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PaymentReports.
     */
    cursor?: PaymentReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaymentReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaymentReports.
     */
    skip?: number
    distinct?: PaymentReportScalarFieldEnum | PaymentReportScalarFieldEnum[]
  }

  /**
   * PaymentReport create
   */
  export type PaymentReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * The data needed to create a PaymentReport.
     */
    data: XOR<PaymentReportCreateInput, PaymentReportUncheckedCreateInput>
  }

  /**
   * PaymentReport createMany
   */
  export type PaymentReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PaymentReports.
     */
    data: PaymentReportCreateManyInput | PaymentReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PaymentReport createManyAndReturn
   */
  export type PaymentReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PaymentReports.
     */
    data: PaymentReportCreateManyInput | PaymentReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PaymentReport update
   */
  export type PaymentReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * The data needed to update a PaymentReport.
     */
    data: XOR<PaymentReportUpdateInput, PaymentReportUncheckedUpdateInput>
    /**
     * Choose, which PaymentReport to update.
     */
    where: PaymentReportWhereUniqueInput
  }

  /**
   * PaymentReport updateMany
   */
  export type PaymentReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PaymentReports.
     */
    data: XOR<PaymentReportUpdateManyMutationInput, PaymentReportUncheckedUpdateManyInput>
    /**
     * Filter which PaymentReports to update
     */
    where?: PaymentReportWhereInput
  }

  /**
   * PaymentReport upsert
   */
  export type PaymentReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * The filter to search for the PaymentReport to update in case it exists.
     */
    where: PaymentReportWhereUniqueInput
    /**
     * In case the PaymentReport found by the `where` argument doesn't exist, create a new PaymentReport with this data.
     */
    create: XOR<PaymentReportCreateInput, PaymentReportUncheckedCreateInput>
    /**
     * In case the PaymentReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentReportUpdateInput, PaymentReportUncheckedUpdateInput>
  }

  /**
   * PaymentReport delete
   */
  export type PaymentReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
    /**
     * Filter which PaymentReport to delete.
     */
    where: PaymentReportWhereUniqueInput
  }

  /**
   * PaymentReport deleteMany
   */
  export type PaymentReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PaymentReports to delete
     */
    where?: PaymentReportWhereInput
  }

  /**
   * PaymentReport without action
   */
  export type PaymentReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaymentReport
     */
    select?: PaymentReportSelect<ExtArgs> | null
  }


  /**
   * Model CategoryPerformanceReport
   */

  export type AggregateCategoryPerformanceReport = {
    _count: CategoryPerformanceReportCountAggregateOutputType | null
    _avg: CategoryPerformanceReportAvgAggregateOutputType | null
    _sum: CategoryPerformanceReportSumAggregateOutputType | null
    _min: CategoryPerformanceReportMinAggregateOutputType | null
    _max: CategoryPerformanceReportMaxAggregateOutputType | null
  }

  export type CategoryPerformanceReportAvgAggregateOutputType = {
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalUnitsSold: number | null
  }

  export type CategoryPerformanceReportSumAggregateOutputType = {
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalUnitsSold: number | null
  }

  export type CategoryPerformanceReportMinAggregateOutputType = {
    id: string | null
    categoryId: string | null
    categoryName: string | null
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalUnitsSold: number | null
    periodType: string | null
    periodDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryPerformanceReportMaxAggregateOutputType = {
    id: string | null
    categoryId: string | null
    categoryName: string | null
    totalProducts: number | null
    totalOrders: number | null
    totalRevenue: Decimal | null
    totalUnitsSold: number | null
    periodType: string | null
    periodDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryPerformanceReportCountAggregateOutputType = {
    id: number
    categoryId: number
    categoryName: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    totalUnitsSold: number
    periodType: number
    periodDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CategoryPerformanceReportAvgAggregateInputType = {
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalUnitsSold?: true
  }

  export type CategoryPerformanceReportSumAggregateInputType = {
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalUnitsSold?: true
  }

  export type CategoryPerformanceReportMinAggregateInputType = {
    id?: true
    categoryId?: true
    categoryName?: true
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalUnitsSold?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryPerformanceReportMaxAggregateInputType = {
    id?: true
    categoryId?: true
    categoryName?: true
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalUnitsSold?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryPerformanceReportCountAggregateInputType = {
    id?: true
    categoryId?: true
    categoryName?: true
    totalProducts?: true
    totalOrders?: true
    totalRevenue?: true
    totalUnitsSold?: true
    periodType?: true
    periodDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CategoryPerformanceReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CategoryPerformanceReport to aggregate.
     */
    where?: CategoryPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoryPerformanceReports to fetch.
     */
    orderBy?: CategoryPerformanceReportOrderByWithRelationInput | CategoryPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoryPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoryPerformanceReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CategoryPerformanceReports
    **/
    _count?: true | CategoryPerformanceReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryPerformanceReportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategoryPerformanceReportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryPerformanceReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryPerformanceReportMaxAggregateInputType
  }

  export type GetCategoryPerformanceReportAggregateType<T extends CategoryPerformanceReportAggregateArgs> = {
        [P in keyof T & keyof AggregateCategoryPerformanceReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategoryPerformanceReport[P]>
      : GetScalarType<T[P], AggregateCategoryPerformanceReport[P]>
  }




  export type CategoryPerformanceReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryPerformanceReportWhereInput
    orderBy?: CategoryPerformanceReportOrderByWithAggregationInput | CategoryPerformanceReportOrderByWithAggregationInput[]
    by: CategoryPerformanceReportScalarFieldEnum[] | CategoryPerformanceReportScalarFieldEnum
    having?: CategoryPerformanceReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryPerformanceReportCountAggregateInputType | true
    _avg?: CategoryPerformanceReportAvgAggregateInputType
    _sum?: CategoryPerformanceReportSumAggregateInputType
    _min?: CategoryPerformanceReportMinAggregateInputType
    _max?: CategoryPerformanceReportMaxAggregateInputType
  }

  export type CategoryPerformanceReportGroupByOutputType = {
    id: string
    categoryId: string
    categoryName: string
    totalProducts: number
    totalOrders: number
    totalRevenue: Decimal
    totalUnitsSold: number
    periodType: string
    periodDate: Date | null
    createdAt: Date
    updatedAt: Date
    _count: CategoryPerformanceReportCountAggregateOutputType | null
    _avg: CategoryPerformanceReportAvgAggregateOutputType | null
    _sum: CategoryPerformanceReportSumAggregateOutputType | null
    _min: CategoryPerformanceReportMinAggregateOutputType | null
    _max: CategoryPerformanceReportMaxAggregateOutputType | null
  }

  type GetCategoryPerformanceReportGroupByPayload<T extends CategoryPerformanceReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryPerformanceReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryPerformanceReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryPerformanceReportGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryPerformanceReportGroupByOutputType[P]>
        }
      >
    >


  export type CategoryPerformanceReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    categoryName?: boolean
    totalProducts?: boolean
    totalOrders?: boolean
    totalRevenue?: boolean
    totalUnitsSold?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["categoryPerformanceReport"]>

  export type CategoryPerformanceReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    categoryName?: boolean
    totalProducts?: boolean
    totalOrders?: boolean
    totalRevenue?: boolean
    totalUnitsSold?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["categoryPerformanceReport"]>

  export type CategoryPerformanceReportSelectScalar = {
    id?: boolean
    categoryId?: boolean
    categoryName?: boolean
    totalProducts?: boolean
    totalOrders?: boolean
    totalRevenue?: boolean
    totalUnitsSold?: boolean
    periodType?: boolean
    periodDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $CategoryPerformanceReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CategoryPerformanceReport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      categoryId: string
      categoryName: string
      totalProducts: number
      totalOrders: number
      totalRevenue: Prisma.Decimal
      totalUnitsSold: number
      periodType: string
      periodDate: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["categoryPerformanceReport"]>
    composites: {}
  }

  type CategoryPerformanceReportGetPayload<S extends boolean | null | undefined | CategoryPerformanceReportDefaultArgs> = $Result.GetResult<Prisma.$CategoryPerformanceReportPayload, S>

  type CategoryPerformanceReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CategoryPerformanceReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CategoryPerformanceReportCountAggregateInputType | true
    }

  export interface CategoryPerformanceReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CategoryPerformanceReport'], meta: { name: 'CategoryPerformanceReport' } }
    /**
     * Find zero or one CategoryPerformanceReport that matches the filter.
     * @param {CategoryPerformanceReportFindUniqueArgs} args - Arguments to find a CategoryPerformanceReport
     * @example
     * // Get one CategoryPerformanceReport
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryPerformanceReportFindUniqueArgs>(args: SelectSubset<T, CategoryPerformanceReportFindUniqueArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CategoryPerformanceReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CategoryPerformanceReportFindUniqueOrThrowArgs} args - Arguments to find a CategoryPerformanceReport
     * @example
     * // Get one CategoryPerformanceReport
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryPerformanceReportFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryPerformanceReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CategoryPerformanceReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportFindFirstArgs} args - Arguments to find a CategoryPerformanceReport
     * @example
     * // Get one CategoryPerformanceReport
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryPerformanceReportFindFirstArgs>(args?: SelectSubset<T, CategoryPerformanceReportFindFirstArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CategoryPerformanceReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportFindFirstOrThrowArgs} args - Arguments to find a CategoryPerformanceReport
     * @example
     * // Get one CategoryPerformanceReport
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryPerformanceReportFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryPerformanceReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CategoryPerformanceReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CategoryPerformanceReports
     * const categoryPerformanceReports = await prisma.categoryPerformanceReport.findMany()
     * 
     * // Get first 10 CategoryPerformanceReports
     * const categoryPerformanceReports = await prisma.categoryPerformanceReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryPerformanceReportWithIdOnly = await prisma.categoryPerformanceReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryPerformanceReportFindManyArgs>(args?: SelectSubset<T, CategoryPerformanceReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CategoryPerformanceReport.
     * @param {CategoryPerformanceReportCreateArgs} args - Arguments to create a CategoryPerformanceReport.
     * @example
     * // Create one CategoryPerformanceReport
     * const CategoryPerformanceReport = await prisma.categoryPerformanceReport.create({
     *   data: {
     *     // ... data to create a CategoryPerformanceReport
     *   }
     * })
     * 
     */
    create<T extends CategoryPerformanceReportCreateArgs>(args: SelectSubset<T, CategoryPerformanceReportCreateArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CategoryPerformanceReports.
     * @param {CategoryPerformanceReportCreateManyArgs} args - Arguments to create many CategoryPerformanceReports.
     * @example
     * // Create many CategoryPerformanceReports
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryPerformanceReportCreateManyArgs>(args?: SelectSubset<T, CategoryPerformanceReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CategoryPerformanceReports and returns the data saved in the database.
     * @param {CategoryPerformanceReportCreateManyAndReturnArgs} args - Arguments to create many CategoryPerformanceReports.
     * @example
     * // Create many CategoryPerformanceReports
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CategoryPerformanceReports and only return the `id`
     * const categoryPerformanceReportWithIdOnly = await prisma.categoryPerformanceReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoryPerformanceReportCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoryPerformanceReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CategoryPerformanceReport.
     * @param {CategoryPerformanceReportDeleteArgs} args - Arguments to delete one CategoryPerformanceReport.
     * @example
     * // Delete one CategoryPerformanceReport
     * const CategoryPerformanceReport = await prisma.categoryPerformanceReport.delete({
     *   where: {
     *     // ... filter to delete one CategoryPerformanceReport
     *   }
     * })
     * 
     */
    delete<T extends CategoryPerformanceReportDeleteArgs>(args: SelectSubset<T, CategoryPerformanceReportDeleteArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CategoryPerformanceReport.
     * @param {CategoryPerformanceReportUpdateArgs} args - Arguments to update one CategoryPerformanceReport.
     * @example
     * // Update one CategoryPerformanceReport
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryPerformanceReportUpdateArgs>(args: SelectSubset<T, CategoryPerformanceReportUpdateArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CategoryPerformanceReports.
     * @param {CategoryPerformanceReportDeleteManyArgs} args - Arguments to filter CategoryPerformanceReports to delete.
     * @example
     * // Delete a few CategoryPerformanceReports
     * const { count } = await prisma.categoryPerformanceReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryPerformanceReportDeleteManyArgs>(args?: SelectSubset<T, CategoryPerformanceReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CategoryPerformanceReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CategoryPerformanceReports
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryPerformanceReportUpdateManyArgs>(args: SelectSubset<T, CategoryPerformanceReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CategoryPerformanceReport.
     * @param {CategoryPerformanceReportUpsertArgs} args - Arguments to update or create a CategoryPerformanceReport.
     * @example
     * // Update or create a CategoryPerformanceReport
     * const categoryPerformanceReport = await prisma.categoryPerformanceReport.upsert({
     *   create: {
     *     // ... data to create a CategoryPerformanceReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CategoryPerformanceReport we want to update
     *   }
     * })
     */
    upsert<T extends CategoryPerformanceReportUpsertArgs>(args: SelectSubset<T, CategoryPerformanceReportUpsertArgs<ExtArgs>>): Prisma__CategoryPerformanceReportClient<$Result.GetResult<Prisma.$CategoryPerformanceReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CategoryPerformanceReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportCountArgs} args - Arguments to filter CategoryPerformanceReports to count.
     * @example
     * // Count the number of CategoryPerformanceReports
     * const count = await prisma.categoryPerformanceReport.count({
     *   where: {
     *     // ... the filter for the CategoryPerformanceReports we want to count
     *   }
     * })
    **/
    count<T extends CategoryPerformanceReportCountArgs>(
      args?: Subset<T, CategoryPerformanceReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryPerformanceReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CategoryPerformanceReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CategoryPerformanceReportAggregateArgs>(args: Subset<T, CategoryPerformanceReportAggregateArgs>): Prisma.PrismaPromise<GetCategoryPerformanceReportAggregateType<T>>

    /**
     * Group by CategoryPerformanceReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryPerformanceReportGroupByArgs} args - Group by arguments.
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
      T extends CategoryPerformanceReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryPerformanceReportGroupByArgs['orderBy'] }
        : { orderBy?: CategoryPerformanceReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CategoryPerformanceReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryPerformanceReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CategoryPerformanceReport model
   */
  readonly fields: CategoryPerformanceReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CategoryPerformanceReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryPerformanceReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the CategoryPerformanceReport model
   */ 
  interface CategoryPerformanceReportFieldRefs {
    readonly id: FieldRef<"CategoryPerformanceReport", 'String'>
    readonly categoryId: FieldRef<"CategoryPerformanceReport", 'String'>
    readonly categoryName: FieldRef<"CategoryPerformanceReport", 'String'>
    readonly totalProducts: FieldRef<"CategoryPerformanceReport", 'Int'>
    readonly totalOrders: FieldRef<"CategoryPerformanceReport", 'Int'>
    readonly totalRevenue: FieldRef<"CategoryPerformanceReport", 'Decimal'>
    readonly totalUnitsSold: FieldRef<"CategoryPerformanceReport", 'Int'>
    readonly periodType: FieldRef<"CategoryPerformanceReport", 'String'>
    readonly periodDate: FieldRef<"CategoryPerformanceReport", 'DateTime'>
    readonly createdAt: FieldRef<"CategoryPerformanceReport", 'DateTime'>
    readonly updatedAt: FieldRef<"CategoryPerformanceReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CategoryPerformanceReport findUnique
   */
  export type CategoryPerformanceReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which CategoryPerformanceReport to fetch.
     */
    where: CategoryPerformanceReportWhereUniqueInput
  }

  /**
   * CategoryPerformanceReport findUniqueOrThrow
   */
  export type CategoryPerformanceReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which CategoryPerformanceReport to fetch.
     */
    where: CategoryPerformanceReportWhereUniqueInput
  }

  /**
   * CategoryPerformanceReport findFirst
   */
  export type CategoryPerformanceReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which CategoryPerformanceReport to fetch.
     */
    where?: CategoryPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoryPerformanceReports to fetch.
     */
    orderBy?: CategoryPerformanceReportOrderByWithRelationInput | CategoryPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CategoryPerformanceReports.
     */
    cursor?: CategoryPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoryPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoryPerformanceReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CategoryPerformanceReports.
     */
    distinct?: CategoryPerformanceReportScalarFieldEnum | CategoryPerformanceReportScalarFieldEnum[]
  }

  /**
   * CategoryPerformanceReport findFirstOrThrow
   */
  export type CategoryPerformanceReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which CategoryPerformanceReport to fetch.
     */
    where?: CategoryPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoryPerformanceReports to fetch.
     */
    orderBy?: CategoryPerformanceReportOrderByWithRelationInput | CategoryPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CategoryPerformanceReports.
     */
    cursor?: CategoryPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoryPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoryPerformanceReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CategoryPerformanceReports.
     */
    distinct?: CategoryPerformanceReportScalarFieldEnum | CategoryPerformanceReportScalarFieldEnum[]
  }

  /**
   * CategoryPerformanceReport findMany
   */
  export type CategoryPerformanceReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter, which CategoryPerformanceReports to fetch.
     */
    where?: CategoryPerformanceReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CategoryPerformanceReports to fetch.
     */
    orderBy?: CategoryPerformanceReportOrderByWithRelationInput | CategoryPerformanceReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CategoryPerformanceReports.
     */
    cursor?: CategoryPerformanceReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CategoryPerformanceReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CategoryPerformanceReports.
     */
    skip?: number
    distinct?: CategoryPerformanceReportScalarFieldEnum | CategoryPerformanceReportScalarFieldEnum[]
  }

  /**
   * CategoryPerformanceReport create
   */
  export type CategoryPerformanceReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * The data needed to create a CategoryPerformanceReport.
     */
    data: XOR<CategoryPerformanceReportCreateInput, CategoryPerformanceReportUncheckedCreateInput>
  }

  /**
   * CategoryPerformanceReport createMany
   */
  export type CategoryPerformanceReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CategoryPerformanceReports.
     */
    data: CategoryPerformanceReportCreateManyInput | CategoryPerformanceReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CategoryPerformanceReport createManyAndReturn
   */
  export type CategoryPerformanceReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CategoryPerformanceReports.
     */
    data: CategoryPerformanceReportCreateManyInput | CategoryPerformanceReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CategoryPerformanceReport update
   */
  export type CategoryPerformanceReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * The data needed to update a CategoryPerformanceReport.
     */
    data: XOR<CategoryPerformanceReportUpdateInput, CategoryPerformanceReportUncheckedUpdateInput>
    /**
     * Choose, which CategoryPerformanceReport to update.
     */
    where: CategoryPerformanceReportWhereUniqueInput
  }

  /**
   * CategoryPerformanceReport updateMany
   */
  export type CategoryPerformanceReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CategoryPerformanceReports.
     */
    data: XOR<CategoryPerformanceReportUpdateManyMutationInput, CategoryPerformanceReportUncheckedUpdateManyInput>
    /**
     * Filter which CategoryPerformanceReports to update
     */
    where?: CategoryPerformanceReportWhereInput
  }

  /**
   * CategoryPerformanceReport upsert
   */
  export type CategoryPerformanceReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * The filter to search for the CategoryPerformanceReport to update in case it exists.
     */
    where: CategoryPerformanceReportWhereUniqueInput
    /**
     * In case the CategoryPerformanceReport found by the `where` argument doesn't exist, create a new CategoryPerformanceReport with this data.
     */
    create: XOR<CategoryPerformanceReportCreateInput, CategoryPerformanceReportUncheckedCreateInput>
    /**
     * In case the CategoryPerformanceReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryPerformanceReportUpdateInput, CategoryPerformanceReportUncheckedUpdateInput>
  }

  /**
   * CategoryPerformanceReport delete
   */
  export type CategoryPerformanceReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
    /**
     * Filter which CategoryPerformanceReport to delete.
     */
    where: CategoryPerformanceReportWhereUniqueInput
  }

  /**
   * CategoryPerformanceReport deleteMany
   */
  export type CategoryPerformanceReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CategoryPerformanceReports to delete
     */
    where?: CategoryPerformanceReportWhereInput
  }

  /**
   * CategoryPerformanceReport without action
   */
  export type CategoryPerformanceReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryPerformanceReport
     */
    select?: CategoryPerformanceReportSelect<ExtArgs> | null
  }


  /**
   * Model AnalyticsEvent
   */

  export type AggregateAnalyticsEvent = {
    _count: AnalyticsEventCountAggregateOutputType | null
    _min: AnalyticsEventMinAggregateOutputType | null
    _max: AnalyticsEventMaxAggregateOutputType | null
  }

  export type AnalyticsEventMinAggregateOutputType = {
    id: string | null
    eventId: string | null
    eventName: string | null
    processedAt: Date | null
    isProcessed: boolean | null
    createdAt: Date | null
  }

  export type AnalyticsEventMaxAggregateOutputType = {
    id: string | null
    eventId: string | null
    eventName: string | null
    processedAt: Date | null
    isProcessed: boolean | null
    createdAt: Date | null
  }

  export type AnalyticsEventCountAggregateOutputType = {
    id: number
    eventId: number
    eventName: number
    eventData: number
    processedAt: number
    isProcessed: number
    createdAt: number
    _all: number
  }


  export type AnalyticsEventMinAggregateInputType = {
    id?: true
    eventId?: true
    eventName?: true
    processedAt?: true
    isProcessed?: true
    createdAt?: true
  }

  export type AnalyticsEventMaxAggregateInputType = {
    id?: true
    eventId?: true
    eventName?: true
    processedAt?: true
    isProcessed?: true
    createdAt?: true
  }

  export type AnalyticsEventCountAggregateInputType = {
    id?: true
    eventId?: true
    eventName?: true
    eventData?: true
    processedAt?: true
    isProcessed?: true
    createdAt?: true
    _all?: true
  }

  export type AnalyticsEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnalyticsEvent to aggregate.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AnalyticsEvents
    **/
    _count?: true | AnalyticsEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnalyticsEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnalyticsEventMaxAggregateInputType
  }

  export type GetAnalyticsEventAggregateType<T extends AnalyticsEventAggregateArgs> = {
        [P in keyof T & keyof AggregateAnalyticsEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnalyticsEvent[P]>
      : GetScalarType<T[P], AggregateAnalyticsEvent[P]>
  }




  export type AnalyticsEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnalyticsEventWhereInput
    orderBy?: AnalyticsEventOrderByWithAggregationInput | AnalyticsEventOrderByWithAggregationInput[]
    by: AnalyticsEventScalarFieldEnum[] | AnalyticsEventScalarFieldEnum
    having?: AnalyticsEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnalyticsEventCountAggregateInputType | true
    _min?: AnalyticsEventMinAggregateInputType
    _max?: AnalyticsEventMaxAggregateInputType
  }

  export type AnalyticsEventGroupByOutputType = {
    id: string
    eventId: string | null
    eventName: string
    eventData: JsonValue
    processedAt: Date | null
    isProcessed: boolean
    createdAt: Date
    _count: AnalyticsEventCountAggregateOutputType | null
    _min: AnalyticsEventMinAggregateOutputType | null
    _max: AnalyticsEventMaxAggregateOutputType | null
  }

  type GetAnalyticsEventGroupByPayload<T extends AnalyticsEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnalyticsEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnalyticsEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnalyticsEventGroupByOutputType[P]>
            : GetScalarType<T[P], AnalyticsEventGroupByOutputType[P]>
        }
      >
    >


  export type AnalyticsEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    eventName?: boolean
    eventData?: boolean
    processedAt?: boolean
    isProcessed?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["analyticsEvent"]>

  export type AnalyticsEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    eventName?: boolean
    eventData?: boolean
    processedAt?: boolean
    isProcessed?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["analyticsEvent"]>

  export type AnalyticsEventSelectScalar = {
    id?: boolean
    eventId?: boolean
    eventName?: boolean
    eventData?: boolean
    processedAt?: boolean
    isProcessed?: boolean
    createdAt?: boolean
  }


  export type $AnalyticsEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnalyticsEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventId: string | null
      eventName: string
      eventData: Prisma.JsonValue
      processedAt: Date | null
      isProcessed: boolean
      createdAt: Date
    }, ExtArgs["result"]["analyticsEvent"]>
    composites: {}
  }

  type AnalyticsEventGetPayload<S extends boolean | null | undefined | AnalyticsEventDefaultArgs> = $Result.GetResult<Prisma.$AnalyticsEventPayload, S>

  type AnalyticsEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AnalyticsEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AnalyticsEventCountAggregateInputType | true
    }

  export interface AnalyticsEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AnalyticsEvent'], meta: { name: 'AnalyticsEvent' } }
    /**
     * Find zero or one AnalyticsEvent that matches the filter.
     * @param {AnalyticsEventFindUniqueArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnalyticsEventFindUniqueArgs>(args: SelectSubset<T, AnalyticsEventFindUniqueArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AnalyticsEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AnalyticsEventFindUniqueOrThrowArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnalyticsEventFindUniqueOrThrowArgs>(args: SelectSubset<T, AnalyticsEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AnalyticsEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindFirstArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnalyticsEventFindFirstArgs>(args?: SelectSubset<T, AnalyticsEventFindFirstArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AnalyticsEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindFirstOrThrowArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnalyticsEventFindFirstOrThrowArgs>(args?: SelectSubset<T, AnalyticsEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AnalyticsEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnalyticsEvents
     * const analyticsEvents = await prisma.analyticsEvent.findMany()
     * 
     * // Get first 10 AnalyticsEvents
     * const analyticsEvents = await prisma.analyticsEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnalyticsEventFindManyArgs>(args?: SelectSubset<T, AnalyticsEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AnalyticsEvent.
     * @param {AnalyticsEventCreateArgs} args - Arguments to create a AnalyticsEvent.
     * @example
     * // Create one AnalyticsEvent
     * const AnalyticsEvent = await prisma.analyticsEvent.create({
     *   data: {
     *     // ... data to create a AnalyticsEvent
     *   }
     * })
     * 
     */
    create<T extends AnalyticsEventCreateArgs>(args: SelectSubset<T, AnalyticsEventCreateArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AnalyticsEvents.
     * @param {AnalyticsEventCreateManyArgs} args - Arguments to create many AnalyticsEvents.
     * @example
     * // Create many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnalyticsEventCreateManyArgs>(args?: SelectSubset<T, AnalyticsEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AnalyticsEvents and returns the data saved in the database.
     * @param {AnalyticsEventCreateManyAndReturnArgs} args - Arguments to create many AnalyticsEvents.
     * @example
     * // Create many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AnalyticsEvents and only return the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnalyticsEventCreateManyAndReturnArgs>(args?: SelectSubset<T, AnalyticsEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AnalyticsEvent.
     * @param {AnalyticsEventDeleteArgs} args - Arguments to delete one AnalyticsEvent.
     * @example
     * // Delete one AnalyticsEvent
     * const AnalyticsEvent = await prisma.analyticsEvent.delete({
     *   where: {
     *     // ... filter to delete one AnalyticsEvent
     *   }
     * })
     * 
     */
    delete<T extends AnalyticsEventDeleteArgs>(args: SelectSubset<T, AnalyticsEventDeleteArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AnalyticsEvent.
     * @param {AnalyticsEventUpdateArgs} args - Arguments to update one AnalyticsEvent.
     * @example
     * // Update one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnalyticsEventUpdateArgs>(args: SelectSubset<T, AnalyticsEventUpdateArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AnalyticsEvents.
     * @param {AnalyticsEventDeleteManyArgs} args - Arguments to filter AnalyticsEvents to delete.
     * @example
     * // Delete a few AnalyticsEvents
     * const { count } = await prisma.analyticsEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnalyticsEventDeleteManyArgs>(args?: SelectSubset<T, AnalyticsEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnalyticsEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnalyticsEventUpdateManyArgs>(args: SelectSubset<T, AnalyticsEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AnalyticsEvent.
     * @param {AnalyticsEventUpsertArgs} args - Arguments to update or create a AnalyticsEvent.
     * @example
     * // Update or create a AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.upsert({
     *   create: {
     *     // ... data to create a AnalyticsEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnalyticsEvent we want to update
     *   }
     * })
     */
    upsert<T extends AnalyticsEventUpsertArgs>(args: SelectSubset<T, AnalyticsEventUpsertArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AnalyticsEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventCountArgs} args - Arguments to filter AnalyticsEvents to count.
     * @example
     * // Count the number of AnalyticsEvents
     * const count = await prisma.analyticsEvent.count({
     *   where: {
     *     // ... the filter for the AnalyticsEvents we want to count
     *   }
     * })
    **/
    count<T extends AnalyticsEventCountArgs>(
      args?: Subset<T, AnalyticsEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnalyticsEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AnalyticsEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AnalyticsEventAggregateArgs>(args: Subset<T, AnalyticsEventAggregateArgs>): Prisma.PrismaPromise<GetAnalyticsEventAggregateType<T>>

    /**
     * Group by AnalyticsEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventGroupByArgs} args - Group by arguments.
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
      T extends AnalyticsEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnalyticsEventGroupByArgs['orderBy'] }
        : { orderBy?: AnalyticsEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AnalyticsEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnalyticsEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AnalyticsEvent model
   */
  readonly fields: AnalyticsEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnalyticsEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnalyticsEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AnalyticsEvent model
   */ 
  interface AnalyticsEventFieldRefs {
    readonly id: FieldRef<"AnalyticsEvent", 'String'>
    readonly eventId: FieldRef<"AnalyticsEvent", 'String'>
    readonly eventName: FieldRef<"AnalyticsEvent", 'String'>
    readonly eventData: FieldRef<"AnalyticsEvent", 'Json'>
    readonly processedAt: FieldRef<"AnalyticsEvent", 'DateTime'>
    readonly isProcessed: FieldRef<"AnalyticsEvent", 'Boolean'>
    readonly createdAt: FieldRef<"AnalyticsEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AnalyticsEvent findUnique
   */
  export type AnalyticsEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent findUniqueOrThrow
   */
  export type AnalyticsEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent findFirst
   */
  export type AnalyticsEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnalyticsEvents.
     */
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * AnalyticsEvent findFirstOrThrow
   */
  export type AnalyticsEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnalyticsEvents.
     */
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * AnalyticsEvent findMany
   */
  export type AnalyticsEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvents to fetch.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * AnalyticsEvent create
   */
  export type AnalyticsEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * The data needed to create a AnalyticsEvent.
     */
    data: XOR<AnalyticsEventCreateInput, AnalyticsEventUncheckedCreateInput>
  }

  /**
   * AnalyticsEvent createMany
   */
  export type AnalyticsEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnalyticsEvents.
     */
    data: AnalyticsEventCreateManyInput | AnalyticsEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AnalyticsEvent createManyAndReturn
   */
  export type AnalyticsEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AnalyticsEvents.
     */
    data: AnalyticsEventCreateManyInput | AnalyticsEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AnalyticsEvent update
   */
  export type AnalyticsEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * The data needed to update a AnalyticsEvent.
     */
    data: XOR<AnalyticsEventUpdateInput, AnalyticsEventUncheckedUpdateInput>
    /**
     * Choose, which AnalyticsEvent to update.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent updateMany
   */
  export type AnalyticsEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnalyticsEvents.
     */
    data: XOR<AnalyticsEventUpdateManyMutationInput, AnalyticsEventUncheckedUpdateManyInput>
    /**
     * Filter which AnalyticsEvents to update
     */
    where?: AnalyticsEventWhereInput
  }

  /**
   * AnalyticsEvent upsert
   */
  export type AnalyticsEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * The filter to search for the AnalyticsEvent to update in case it exists.
     */
    where: AnalyticsEventWhereUniqueInput
    /**
     * In case the AnalyticsEvent found by the `where` argument doesn't exist, create a new AnalyticsEvent with this data.
     */
    create: XOR<AnalyticsEventCreateInput, AnalyticsEventUncheckedCreateInput>
    /**
     * In case the AnalyticsEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnalyticsEventUpdateInput, AnalyticsEventUncheckedUpdateInput>
  }

  /**
   * AnalyticsEvent delete
   */
  export type AnalyticsEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Filter which AnalyticsEvent to delete.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent deleteMany
   */
  export type AnalyticsEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnalyticsEvents to delete
     */
    where?: AnalyticsEventWhereInput
  }

  /**
   * AnalyticsEvent without action
   */
  export type AnalyticsEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
  }


  /**
   * Model InboxEvent
   */

  export type AggregateInboxEvent = {
    _count: InboxEventCountAggregateOutputType | null
    _avg: InboxEventAvgAggregateOutputType | null
    _sum: InboxEventSumAggregateOutputType | null
    _min: InboxEventMinAggregateOutputType | null
    _max: InboxEventMaxAggregateOutputType | null
  }

  export type InboxEventAvgAggregateOutputType = {
    attempts: number | null
  }

  export type InboxEventSumAggregateOutputType = {
    attempts: number | null
  }

  export type InboxEventMinAggregateOutputType = {
    id: string | null
    eventId: string | null
    consumer: string | null
    eventName: string | null
    status: string | null
    attempts: number | null
    lastError: string | null
    processedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InboxEventMaxAggregateOutputType = {
    id: string | null
    eventId: string | null
    consumer: string | null
    eventName: string | null
    status: string | null
    attempts: number | null
    lastError: string | null
    processedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InboxEventCountAggregateOutputType = {
    id: number
    eventId: number
    consumer: number
    eventName: number
    payload: number
    status: number
    attempts: number
    lastError: number
    processedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InboxEventAvgAggregateInputType = {
    attempts?: true
  }

  export type InboxEventSumAggregateInputType = {
    attempts?: true
  }

  export type InboxEventMinAggregateInputType = {
    id?: true
    eventId?: true
    consumer?: true
    eventName?: true
    status?: true
    attempts?: true
    lastError?: true
    processedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InboxEventMaxAggregateInputType = {
    id?: true
    eventId?: true
    consumer?: true
    eventName?: true
    status?: true
    attempts?: true
    lastError?: true
    processedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InboxEventCountAggregateInputType = {
    id?: true
    eventId?: true
    consumer?: true
    eventName?: true
    payload?: true
    status?: true
    attempts?: true
    lastError?: true
    processedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InboxEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InboxEvent to aggregate.
     */
    where?: InboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InboxEvents to fetch.
     */
    orderBy?: InboxEventOrderByWithRelationInput | InboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InboxEvents
    **/
    _count?: true | InboxEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InboxEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InboxEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InboxEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InboxEventMaxAggregateInputType
  }

  export type GetInboxEventAggregateType<T extends InboxEventAggregateArgs> = {
        [P in keyof T & keyof AggregateInboxEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInboxEvent[P]>
      : GetScalarType<T[P], AggregateInboxEvent[P]>
  }




  export type InboxEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InboxEventWhereInput
    orderBy?: InboxEventOrderByWithAggregationInput | InboxEventOrderByWithAggregationInput[]
    by: InboxEventScalarFieldEnum[] | InboxEventScalarFieldEnum
    having?: InboxEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InboxEventCountAggregateInputType | true
    _avg?: InboxEventAvgAggregateInputType
    _sum?: InboxEventSumAggregateInputType
    _min?: InboxEventMinAggregateInputType
    _max?: InboxEventMaxAggregateInputType
  }

  export type InboxEventGroupByOutputType = {
    id: string
    eventId: string
    consumer: string
    eventName: string
    payload: JsonValue
    status: string
    attempts: number
    lastError: string | null
    processedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: InboxEventCountAggregateOutputType | null
    _avg: InboxEventAvgAggregateOutputType | null
    _sum: InboxEventSumAggregateOutputType | null
    _min: InboxEventMinAggregateOutputType | null
    _max: InboxEventMaxAggregateOutputType | null
  }

  type GetInboxEventGroupByPayload<T extends InboxEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InboxEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InboxEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InboxEventGroupByOutputType[P]>
            : GetScalarType<T[P], InboxEventGroupByOutputType[P]>
        }
      >
    >


  export type InboxEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    consumer?: boolean
    eventName?: boolean
    payload?: boolean
    status?: boolean
    attempts?: boolean
    lastError?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inboxEvent"]>

  export type InboxEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    consumer?: boolean
    eventName?: boolean
    payload?: boolean
    status?: boolean
    attempts?: boolean
    lastError?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inboxEvent"]>

  export type InboxEventSelectScalar = {
    id?: boolean
    eventId?: boolean
    consumer?: boolean
    eventName?: boolean
    payload?: boolean
    status?: boolean
    attempts?: boolean
    lastError?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $InboxEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InboxEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventId: string
      consumer: string
      eventName: string
      payload: Prisma.JsonValue
      status: string
      attempts: number
      lastError: string | null
      processedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["inboxEvent"]>
    composites: {}
  }

  type InboxEventGetPayload<S extends boolean | null | undefined | InboxEventDefaultArgs> = $Result.GetResult<Prisma.$InboxEventPayload, S>

  type InboxEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InboxEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InboxEventCountAggregateInputType | true
    }

  export interface InboxEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InboxEvent'], meta: { name: 'InboxEvent' } }
    /**
     * Find zero or one InboxEvent that matches the filter.
     * @param {InboxEventFindUniqueArgs} args - Arguments to find a InboxEvent
     * @example
     * // Get one InboxEvent
     * const inboxEvent = await prisma.inboxEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InboxEventFindUniqueArgs>(args: SelectSubset<T, InboxEventFindUniqueArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InboxEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InboxEventFindUniqueOrThrowArgs} args - Arguments to find a InboxEvent
     * @example
     * // Get one InboxEvent
     * const inboxEvent = await prisma.inboxEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InboxEventFindUniqueOrThrowArgs>(args: SelectSubset<T, InboxEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InboxEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventFindFirstArgs} args - Arguments to find a InboxEvent
     * @example
     * // Get one InboxEvent
     * const inboxEvent = await prisma.inboxEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InboxEventFindFirstArgs>(args?: SelectSubset<T, InboxEventFindFirstArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InboxEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventFindFirstOrThrowArgs} args - Arguments to find a InboxEvent
     * @example
     * // Get one InboxEvent
     * const inboxEvent = await prisma.inboxEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InboxEventFindFirstOrThrowArgs>(args?: SelectSubset<T, InboxEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InboxEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InboxEvents
     * const inboxEvents = await prisma.inboxEvent.findMany()
     * 
     * // Get first 10 InboxEvents
     * const inboxEvents = await prisma.inboxEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inboxEventWithIdOnly = await prisma.inboxEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InboxEventFindManyArgs>(args?: SelectSubset<T, InboxEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InboxEvent.
     * @param {InboxEventCreateArgs} args - Arguments to create a InboxEvent.
     * @example
     * // Create one InboxEvent
     * const InboxEvent = await prisma.inboxEvent.create({
     *   data: {
     *     // ... data to create a InboxEvent
     *   }
     * })
     * 
     */
    create<T extends InboxEventCreateArgs>(args: SelectSubset<T, InboxEventCreateArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InboxEvents.
     * @param {InboxEventCreateManyArgs} args - Arguments to create many InboxEvents.
     * @example
     * // Create many InboxEvents
     * const inboxEvent = await prisma.inboxEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InboxEventCreateManyArgs>(args?: SelectSubset<T, InboxEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InboxEvents and returns the data saved in the database.
     * @param {InboxEventCreateManyAndReturnArgs} args - Arguments to create many InboxEvents.
     * @example
     * // Create many InboxEvents
     * const inboxEvent = await prisma.inboxEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InboxEvents and only return the `id`
     * const inboxEventWithIdOnly = await prisma.inboxEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InboxEventCreateManyAndReturnArgs>(args?: SelectSubset<T, InboxEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InboxEvent.
     * @param {InboxEventDeleteArgs} args - Arguments to delete one InboxEvent.
     * @example
     * // Delete one InboxEvent
     * const InboxEvent = await prisma.inboxEvent.delete({
     *   where: {
     *     // ... filter to delete one InboxEvent
     *   }
     * })
     * 
     */
    delete<T extends InboxEventDeleteArgs>(args: SelectSubset<T, InboxEventDeleteArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InboxEvent.
     * @param {InboxEventUpdateArgs} args - Arguments to update one InboxEvent.
     * @example
     * // Update one InboxEvent
     * const inboxEvent = await prisma.inboxEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InboxEventUpdateArgs>(args: SelectSubset<T, InboxEventUpdateArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InboxEvents.
     * @param {InboxEventDeleteManyArgs} args - Arguments to filter InboxEvents to delete.
     * @example
     * // Delete a few InboxEvents
     * const { count } = await prisma.inboxEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InboxEventDeleteManyArgs>(args?: SelectSubset<T, InboxEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InboxEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InboxEvents
     * const inboxEvent = await prisma.inboxEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InboxEventUpdateManyArgs>(args: SelectSubset<T, InboxEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InboxEvent.
     * @param {InboxEventUpsertArgs} args - Arguments to update or create a InboxEvent.
     * @example
     * // Update or create a InboxEvent
     * const inboxEvent = await prisma.inboxEvent.upsert({
     *   create: {
     *     // ... data to create a InboxEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InboxEvent we want to update
     *   }
     * })
     */
    upsert<T extends InboxEventUpsertArgs>(args: SelectSubset<T, InboxEventUpsertArgs<ExtArgs>>): Prisma__InboxEventClient<$Result.GetResult<Prisma.$InboxEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InboxEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventCountArgs} args - Arguments to filter InboxEvents to count.
     * @example
     * // Count the number of InboxEvents
     * const count = await prisma.inboxEvent.count({
     *   where: {
     *     // ... the filter for the InboxEvents we want to count
     *   }
     * })
    **/
    count<T extends InboxEventCountArgs>(
      args?: Subset<T, InboxEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InboxEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InboxEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InboxEventAggregateArgs>(args: Subset<T, InboxEventAggregateArgs>): Prisma.PrismaPromise<GetInboxEventAggregateType<T>>

    /**
     * Group by InboxEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxEventGroupByArgs} args - Group by arguments.
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
      T extends InboxEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InboxEventGroupByArgs['orderBy'] }
        : { orderBy?: InboxEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InboxEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInboxEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InboxEvent model
   */
  readonly fields: InboxEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InboxEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InboxEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the InboxEvent model
   */ 
  interface InboxEventFieldRefs {
    readonly id: FieldRef<"InboxEvent", 'String'>
    readonly eventId: FieldRef<"InboxEvent", 'String'>
    readonly consumer: FieldRef<"InboxEvent", 'String'>
    readonly eventName: FieldRef<"InboxEvent", 'String'>
    readonly payload: FieldRef<"InboxEvent", 'Json'>
    readonly status: FieldRef<"InboxEvent", 'String'>
    readonly attempts: FieldRef<"InboxEvent", 'Int'>
    readonly lastError: FieldRef<"InboxEvent", 'String'>
    readonly processedAt: FieldRef<"InboxEvent", 'DateTime'>
    readonly createdAt: FieldRef<"InboxEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"InboxEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InboxEvent findUnique
   */
  export type InboxEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * Filter, which InboxEvent to fetch.
     */
    where: InboxEventWhereUniqueInput
  }

  /**
   * InboxEvent findUniqueOrThrow
   */
  export type InboxEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * Filter, which InboxEvent to fetch.
     */
    where: InboxEventWhereUniqueInput
  }

  /**
   * InboxEvent findFirst
   */
  export type InboxEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * Filter, which InboxEvent to fetch.
     */
    where?: InboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InboxEvents to fetch.
     */
    orderBy?: InboxEventOrderByWithRelationInput | InboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InboxEvents.
     */
    cursor?: InboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InboxEvents.
     */
    distinct?: InboxEventScalarFieldEnum | InboxEventScalarFieldEnum[]
  }

  /**
   * InboxEvent findFirstOrThrow
   */
  export type InboxEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * Filter, which InboxEvent to fetch.
     */
    where?: InboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InboxEvents to fetch.
     */
    orderBy?: InboxEventOrderByWithRelationInput | InboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InboxEvents.
     */
    cursor?: InboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InboxEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InboxEvents.
     */
    distinct?: InboxEventScalarFieldEnum | InboxEventScalarFieldEnum[]
  }

  /**
   * InboxEvent findMany
   */
  export type InboxEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * Filter, which InboxEvents to fetch.
     */
    where?: InboxEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InboxEvents to fetch.
     */
    orderBy?: InboxEventOrderByWithRelationInput | InboxEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InboxEvents.
     */
    cursor?: InboxEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InboxEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InboxEvents.
     */
    skip?: number
    distinct?: InboxEventScalarFieldEnum | InboxEventScalarFieldEnum[]
  }

  /**
   * InboxEvent create
   */
  export type InboxEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * The data needed to create a InboxEvent.
     */
    data: XOR<InboxEventCreateInput, InboxEventUncheckedCreateInput>
  }

  /**
   * InboxEvent createMany
   */
  export type InboxEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InboxEvents.
     */
    data: InboxEventCreateManyInput | InboxEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InboxEvent createManyAndReturn
   */
  export type InboxEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InboxEvents.
     */
    data: InboxEventCreateManyInput | InboxEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InboxEvent update
   */
  export type InboxEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * The data needed to update a InboxEvent.
     */
    data: XOR<InboxEventUpdateInput, InboxEventUncheckedUpdateInput>
    /**
     * Choose, which InboxEvent to update.
     */
    where: InboxEventWhereUniqueInput
  }

  /**
   * InboxEvent updateMany
   */
  export type InboxEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InboxEvents.
     */
    data: XOR<InboxEventUpdateManyMutationInput, InboxEventUncheckedUpdateManyInput>
    /**
     * Filter which InboxEvents to update
     */
    where?: InboxEventWhereInput
  }

  /**
   * InboxEvent upsert
   */
  export type InboxEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * The filter to search for the InboxEvent to update in case it exists.
     */
    where: InboxEventWhereUniqueInput
    /**
     * In case the InboxEvent found by the `where` argument doesn't exist, create a new InboxEvent with this data.
     */
    create: XOR<InboxEventCreateInput, InboxEventUncheckedCreateInput>
    /**
     * In case the InboxEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InboxEventUpdateInput, InboxEventUncheckedUpdateInput>
  }

  /**
   * InboxEvent delete
   */
  export type InboxEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
    /**
     * Filter which InboxEvent to delete.
     */
    where: InboxEventWhereUniqueInput
  }

  /**
   * InboxEvent deleteMany
   */
  export type InboxEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InboxEvents to delete
     */
    where?: InboxEventWhereInput
  }

  /**
   * InboxEvent without action
   */
  export type InboxEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxEvent
     */
    select?: InboxEventSelect<ExtArgs> | null
  }


  /**
   * Model DailySalesProjection
   */

  export type AggregateDailySalesProjection = {
    _count: DailySalesProjectionCountAggregateOutputType | null
    _avg: DailySalesProjectionAvgAggregateOutputType | null
    _sum: DailySalesProjectionSumAggregateOutputType | null
    _min: DailySalesProjectionMinAggregateOutputType | null
    _max: DailySalesProjectionMaxAggregateOutputType | null
  }

  export type DailySalesProjectionAvgAggregateOutputType = {
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
  }

  export type DailySalesProjectionSumAggregateOutputType = {
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
  }

  export type DailySalesProjectionMinAggregateOutputType = {
    id: string | null
    date: Date | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    updatedAt: Date | null
  }

  export type DailySalesProjectionMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    totalOrders: number | null
    totalCompletedOrders: number | null
    totalCancelledOrders: number | null
    totalRevenue: Decimal | null
    totalItemsSold: number | null
    updatedAt: Date | null
  }

  export type DailySalesProjectionCountAggregateOutputType = {
    id: number
    date: number
    totalOrders: number
    totalCompletedOrders: number
    totalCancelledOrders: number
    totalRevenue: number
    totalItemsSold: number
    updatedAt: number
    _all: number
  }


  export type DailySalesProjectionAvgAggregateInputType = {
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
  }

  export type DailySalesProjectionSumAggregateInputType = {
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
  }

  export type DailySalesProjectionMinAggregateInputType = {
    id?: true
    date?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    updatedAt?: true
  }

  export type DailySalesProjectionMaxAggregateInputType = {
    id?: true
    date?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    updatedAt?: true
  }

  export type DailySalesProjectionCountAggregateInputType = {
    id?: true
    date?: true
    totalOrders?: true
    totalCompletedOrders?: true
    totalCancelledOrders?: true
    totalRevenue?: true
    totalItemsSold?: true
    updatedAt?: true
    _all?: true
  }

  export type DailySalesProjectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailySalesProjection to aggregate.
     */
    where?: DailySalesProjectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesProjections to fetch.
     */
    orderBy?: DailySalesProjectionOrderByWithRelationInput | DailySalesProjectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailySalesProjectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesProjections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesProjections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailySalesProjections
    **/
    _count?: true | DailySalesProjectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailySalesProjectionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailySalesProjectionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailySalesProjectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailySalesProjectionMaxAggregateInputType
  }

  export type GetDailySalesProjectionAggregateType<T extends DailySalesProjectionAggregateArgs> = {
        [P in keyof T & keyof AggregateDailySalesProjection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailySalesProjection[P]>
      : GetScalarType<T[P], AggregateDailySalesProjection[P]>
  }




  export type DailySalesProjectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailySalesProjectionWhereInput
    orderBy?: DailySalesProjectionOrderByWithAggregationInput | DailySalesProjectionOrderByWithAggregationInput[]
    by: DailySalesProjectionScalarFieldEnum[] | DailySalesProjectionScalarFieldEnum
    having?: DailySalesProjectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailySalesProjectionCountAggregateInputType | true
    _avg?: DailySalesProjectionAvgAggregateInputType
    _sum?: DailySalesProjectionSumAggregateInputType
    _min?: DailySalesProjectionMinAggregateInputType
    _max?: DailySalesProjectionMaxAggregateInputType
  }

  export type DailySalesProjectionGroupByOutputType = {
    id: string
    date: Date
    totalOrders: number
    totalCompletedOrders: number
    totalCancelledOrders: number
    totalRevenue: Decimal
    totalItemsSold: number
    updatedAt: Date
    _count: DailySalesProjectionCountAggregateOutputType | null
    _avg: DailySalesProjectionAvgAggregateOutputType | null
    _sum: DailySalesProjectionSumAggregateOutputType | null
    _min: DailySalesProjectionMinAggregateOutputType | null
    _max: DailySalesProjectionMaxAggregateOutputType | null
  }

  type GetDailySalesProjectionGroupByPayload<T extends DailySalesProjectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailySalesProjectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailySalesProjectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailySalesProjectionGroupByOutputType[P]>
            : GetScalarType<T[P], DailySalesProjectionGroupByOutputType[P]>
        }
      >
    >


  export type DailySalesProjectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dailySalesProjection"]>

  export type DailySalesProjectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dailySalesProjection"]>

  export type DailySalesProjectionSelectScalar = {
    id?: boolean
    date?: boolean
    totalOrders?: boolean
    totalCompletedOrders?: boolean
    totalCancelledOrders?: boolean
    totalRevenue?: boolean
    totalItemsSold?: boolean
    updatedAt?: boolean
  }


  export type $DailySalesProjectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailySalesProjection"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      totalOrders: number
      totalCompletedOrders: number
      totalCancelledOrders: number
      totalRevenue: Prisma.Decimal
      totalItemsSold: number
      updatedAt: Date
    }, ExtArgs["result"]["dailySalesProjection"]>
    composites: {}
  }

  type DailySalesProjectionGetPayload<S extends boolean | null | undefined | DailySalesProjectionDefaultArgs> = $Result.GetResult<Prisma.$DailySalesProjectionPayload, S>

  type DailySalesProjectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DailySalesProjectionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DailySalesProjectionCountAggregateInputType | true
    }

  export interface DailySalesProjectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailySalesProjection'], meta: { name: 'DailySalesProjection' } }
    /**
     * Find zero or one DailySalesProjection that matches the filter.
     * @param {DailySalesProjectionFindUniqueArgs} args - Arguments to find a DailySalesProjection
     * @example
     * // Get one DailySalesProjection
     * const dailySalesProjection = await prisma.dailySalesProjection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailySalesProjectionFindUniqueArgs>(args: SelectSubset<T, DailySalesProjectionFindUniqueArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DailySalesProjection that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DailySalesProjectionFindUniqueOrThrowArgs} args - Arguments to find a DailySalesProjection
     * @example
     * // Get one DailySalesProjection
     * const dailySalesProjection = await prisma.dailySalesProjection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailySalesProjectionFindUniqueOrThrowArgs>(args: SelectSubset<T, DailySalesProjectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DailySalesProjection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionFindFirstArgs} args - Arguments to find a DailySalesProjection
     * @example
     * // Get one DailySalesProjection
     * const dailySalesProjection = await prisma.dailySalesProjection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailySalesProjectionFindFirstArgs>(args?: SelectSubset<T, DailySalesProjectionFindFirstArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DailySalesProjection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionFindFirstOrThrowArgs} args - Arguments to find a DailySalesProjection
     * @example
     * // Get one DailySalesProjection
     * const dailySalesProjection = await prisma.dailySalesProjection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailySalesProjectionFindFirstOrThrowArgs>(args?: SelectSubset<T, DailySalesProjectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DailySalesProjections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailySalesProjections
     * const dailySalesProjections = await prisma.dailySalesProjection.findMany()
     * 
     * // Get first 10 DailySalesProjections
     * const dailySalesProjections = await prisma.dailySalesProjection.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailySalesProjectionWithIdOnly = await prisma.dailySalesProjection.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailySalesProjectionFindManyArgs>(args?: SelectSubset<T, DailySalesProjectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DailySalesProjection.
     * @param {DailySalesProjectionCreateArgs} args - Arguments to create a DailySalesProjection.
     * @example
     * // Create one DailySalesProjection
     * const DailySalesProjection = await prisma.dailySalesProjection.create({
     *   data: {
     *     // ... data to create a DailySalesProjection
     *   }
     * })
     * 
     */
    create<T extends DailySalesProjectionCreateArgs>(args: SelectSubset<T, DailySalesProjectionCreateArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DailySalesProjections.
     * @param {DailySalesProjectionCreateManyArgs} args - Arguments to create many DailySalesProjections.
     * @example
     * // Create many DailySalesProjections
     * const dailySalesProjection = await prisma.dailySalesProjection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailySalesProjectionCreateManyArgs>(args?: SelectSubset<T, DailySalesProjectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DailySalesProjections and returns the data saved in the database.
     * @param {DailySalesProjectionCreateManyAndReturnArgs} args - Arguments to create many DailySalesProjections.
     * @example
     * // Create many DailySalesProjections
     * const dailySalesProjection = await prisma.dailySalesProjection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DailySalesProjections and only return the `id`
     * const dailySalesProjectionWithIdOnly = await prisma.dailySalesProjection.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DailySalesProjectionCreateManyAndReturnArgs>(args?: SelectSubset<T, DailySalesProjectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DailySalesProjection.
     * @param {DailySalesProjectionDeleteArgs} args - Arguments to delete one DailySalesProjection.
     * @example
     * // Delete one DailySalesProjection
     * const DailySalesProjection = await prisma.dailySalesProjection.delete({
     *   where: {
     *     // ... filter to delete one DailySalesProjection
     *   }
     * })
     * 
     */
    delete<T extends DailySalesProjectionDeleteArgs>(args: SelectSubset<T, DailySalesProjectionDeleteArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DailySalesProjection.
     * @param {DailySalesProjectionUpdateArgs} args - Arguments to update one DailySalesProjection.
     * @example
     * // Update one DailySalesProjection
     * const dailySalesProjection = await prisma.dailySalesProjection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailySalesProjectionUpdateArgs>(args: SelectSubset<T, DailySalesProjectionUpdateArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DailySalesProjections.
     * @param {DailySalesProjectionDeleteManyArgs} args - Arguments to filter DailySalesProjections to delete.
     * @example
     * // Delete a few DailySalesProjections
     * const { count } = await prisma.dailySalesProjection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailySalesProjectionDeleteManyArgs>(args?: SelectSubset<T, DailySalesProjectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailySalesProjections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailySalesProjections
     * const dailySalesProjection = await prisma.dailySalesProjection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailySalesProjectionUpdateManyArgs>(args: SelectSubset<T, DailySalesProjectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DailySalesProjection.
     * @param {DailySalesProjectionUpsertArgs} args - Arguments to update or create a DailySalesProjection.
     * @example
     * // Update or create a DailySalesProjection
     * const dailySalesProjection = await prisma.dailySalesProjection.upsert({
     *   create: {
     *     // ... data to create a DailySalesProjection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailySalesProjection we want to update
     *   }
     * })
     */
    upsert<T extends DailySalesProjectionUpsertArgs>(args: SelectSubset<T, DailySalesProjectionUpsertArgs<ExtArgs>>): Prisma__DailySalesProjectionClient<$Result.GetResult<Prisma.$DailySalesProjectionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DailySalesProjections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionCountArgs} args - Arguments to filter DailySalesProjections to count.
     * @example
     * // Count the number of DailySalesProjections
     * const count = await prisma.dailySalesProjection.count({
     *   where: {
     *     // ... the filter for the DailySalesProjections we want to count
     *   }
     * })
    **/
    count<T extends DailySalesProjectionCountArgs>(
      args?: Subset<T, DailySalesProjectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailySalesProjectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailySalesProjection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DailySalesProjectionAggregateArgs>(args: Subset<T, DailySalesProjectionAggregateArgs>): Prisma.PrismaPromise<GetDailySalesProjectionAggregateType<T>>

    /**
     * Group by DailySalesProjection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailySalesProjectionGroupByArgs} args - Group by arguments.
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
      T extends DailySalesProjectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailySalesProjectionGroupByArgs['orderBy'] }
        : { orderBy?: DailySalesProjectionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DailySalesProjectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailySalesProjectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailySalesProjection model
   */
  readonly fields: DailySalesProjectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailySalesProjection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailySalesProjectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DailySalesProjection model
   */ 
  interface DailySalesProjectionFieldRefs {
    readonly id: FieldRef<"DailySalesProjection", 'String'>
    readonly date: FieldRef<"DailySalesProjection", 'DateTime'>
    readonly totalOrders: FieldRef<"DailySalesProjection", 'Int'>
    readonly totalCompletedOrders: FieldRef<"DailySalesProjection", 'Int'>
    readonly totalCancelledOrders: FieldRef<"DailySalesProjection", 'Int'>
    readonly totalRevenue: FieldRef<"DailySalesProjection", 'Decimal'>
    readonly totalItemsSold: FieldRef<"DailySalesProjection", 'Int'>
    readonly updatedAt: FieldRef<"DailySalesProjection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailySalesProjection findUnique
   */
  export type DailySalesProjectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesProjection to fetch.
     */
    where: DailySalesProjectionWhereUniqueInput
  }

  /**
   * DailySalesProjection findUniqueOrThrow
   */
  export type DailySalesProjectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesProjection to fetch.
     */
    where: DailySalesProjectionWhereUniqueInput
  }

  /**
   * DailySalesProjection findFirst
   */
  export type DailySalesProjectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesProjection to fetch.
     */
    where?: DailySalesProjectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesProjections to fetch.
     */
    orderBy?: DailySalesProjectionOrderByWithRelationInput | DailySalesProjectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailySalesProjections.
     */
    cursor?: DailySalesProjectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesProjections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesProjections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailySalesProjections.
     */
    distinct?: DailySalesProjectionScalarFieldEnum | DailySalesProjectionScalarFieldEnum[]
  }

  /**
   * DailySalesProjection findFirstOrThrow
   */
  export type DailySalesProjectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesProjection to fetch.
     */
    where?: DailySalesProjectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesProjections to fetch.
     */
    orderBy?: DailySalesProjectionOrderByWithRelationInput | DailySalesProjectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailySalesProjections.
     */
    cursor?: DailySalesProjectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesProjections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesProjections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailySalesProjections.
     */
    distinct?: DailySalesProjectionScalarFieldEnum | DailySalesProjectionScalarFieldEnum[]
  }

  /**
   * DailySalesProjection findMany
   */
  export type DailySalesProjectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * Filter, which DailySalesProjections to fetch.
     */
    where?: DailySalesProjectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailySalesProjections to fetch.
     */
    orderBy?: DailySalesProjectionOrderByWithRelationInput | DailySalesProjectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailySalesProjections.
     */
    cursor?: DailySalesProjectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailySalesProjections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailySalesProjections.
     */
    skip?: number
    distinct?: DailySalesProjectionScalarFieldEnum | DailySalesProjectionScalarFieldEnum[]
  }

  /**
   * DailySalesProjection create
   */
  export type DailySalesProjectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * The data needed to create a DailySalesProjection.
     */
    data: XOR<DailySalesProjectionCreateInput, DailySalesProjectionUncheckedCreateInput>
  }

  /**
   * DailySalesProjection createMany
   */
  export type DailySalesProjectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailySalesProjections.
     */
    data: DailySalesProjectionCreateManyInput | DailySalesProjectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailySalesProjection createManyAndReturn
   */
  export type DailySalesProjectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DailySalesProjections.
     */
    data: DailySalesProjectionCreateManyInput | DailySalesProjectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailySalesProjection update
   */
  export type DailySalesProjectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * The data needed to update a DailySalesProjection.
     */
    data: XOR<DailySalesProjectionUpdateInput, DailySalesProjectionUncheckedUpdateInput>
    /**
     * Choose, which DailySalesProjection to update.
     */
    where: DailySalesProjectionWhereUniqueInput
  }

  /**
   * DailySalesProjection updateMany
   */
  export type DailySalesProjectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailySalesProjections.
     */
    data: XOR<DailySalesProjectionUpdateManyMutationInput, DailySalesProjectionUncheckedUpdateManyInput>
    /**
     * Filter which DailySalesProjections to update
     */
    where?: DailySalesProjectionWhereInput
  }

  /**
   * DailySalesProjection upsert
   */
  export type DailySalesProjectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * The filter to search for the DailySalesProjection to update in case it exists.
     */
    where: DailySalesProjectionWhereUniqueInput
    /**
     * In case the DailySalesProjection found by the `where` argument doesn't exist, create a new DailySalesProjection with this data.
     */
    create: XOR<DailySalesProjectionCreateInput, DailySalesProjectionUncheckedCreateInput>
    /**
     * In case the DailySalesProjection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailySalesProjectionUpdateInput, DailySalesProjectionUncheckedUpdateInput>
  }

  /**
   * DailySalesProjection delete
   */
  export type DailySalesProjectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
    /**
     * Filter which DailySalesProjection to delete.
     */
    where: DailySalesProjectionWhereUniqueInput
  }

  /**
   * DailySalesProjection deleteMany
   */
  export type DailySalesProjectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailySalesProjections to delete
     */
    where?: DailySalesProjectionWhereInput
  }

  /**
   * DailySalesProjection without action
   */
  export type DailySalesProjectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailySalesProjection
     */
    select?: DailySalesProjectionSelect<ExtArgs> | null
  }


  /**
   * Model KafkaProjectionProgress
   */

  export type AggregateKafkaProjectionProgress = {
    _count: KafkaProjectionProgressCountAggregateOutputType | null
    _avg: KafkaProjectionProgressAvgAggregateOutputType | null
    _sum: KafkaProjectionProgressSumAggregateOutputType | null
    _min: KafkaProjectionProgressMinAggregateOutputType | null
    _max: KafkaProjectionProgressMaxAggregateOutputType | null
  }

  export type KafkaProjectionProgressAvgAggregateOutputType = {
    partition: number | null
    lastOffset: number | null
  }

  export type KafkaProjectionProgressSumAggregateOutputType = {
    partition: number | null
    lastOffset: bigint | null
  }

  export type KafkaProjectionProgressMinAggregateOutputType = {
    id: string | null
    consumerGroup: string | null
    topic: string | null
    partition: number | null
    lastOffset: bigint | null
    lastEventAt: Date | null
    updatedAt: Date | null
  }

  export type KafkaProjectionProgressMaxAggregateOutputType = {
    id: string | null
    consumerGroup: string | null
    topic: string | null
    partition: number | null
    lastOffset: bigint | null
    lastEventAt: Date | null
    updatedAt: Date | null
  }

  export type KafkaProjectionProgressCountAggregateOutputType = {
    id: number
    consumerGroup: number
    topic: number
    partition: number
    lastOffset: number
    lastEventAt: number
    updatedAt: number
    _all: number
  }


  export type KafkaProjectionProgressAvgAggregateInputType = {
    partition?: true
    lastOffset?: true
  }

  export type KafkaProjectionProgressSumAggregateInputType = {
    partition?: true
    lastOffset?: true
  }

  export type KafkaProjectionProgressMinAggregateInputType = {
    id?: true
    consumerGroup?: true
    topic?: true
    partition?: true
    lastOffset?: true
    lastEventAt?: true
    updatedAt?: true
  }

  export type KafkaProjectionProgressMaxAggregateInputType = {
    id?: true
    consumerGroup?: true
    topic?: true
    partition?: true
    lastOffset?: true
    lastEventAt?: true
    updatedAt?: true
  }

  export type KafkaProjectionProgressCountAggregateInputType = {
    id?: true
    consumerGroup?: true
    topic?: true
    partition?: true
    lastOffset?: true
    lastEventAt?: true
    updatedAt?: true
    _all?: true
  }

  export type KafkaProjectionProgressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KafkaProjectionProgress to aggregate.
     */
    where?: KafkaProjectionProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KafkaProjectionProgresses to fetch.
     */
    orderBy?: KafkaProjectionProgressOrderByWithRelationInput | KafkaProjectionProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KafkaProjectionProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KafkaProjectionProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KafkaProjectionProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KafkaProjectionProgresses
    **/
    _count?: true | KafkaProjectionProgressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KafkaProjectionProgressAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KafkaProjectionProgressSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KafkaProjectionProgressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KafkaProjectionProgressMaxAggregateInputType
  }

  export type GetKafkaProjectionProgressAggregateType<T extends KafkaProjectionProgressAggregateArgs> = {
        [P in keyof T & keyof AggregateKafkaProjectionProgress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKafkaProjectionProgress[P]>
      : GetScalarType<T[P], AggregateKafkaProjectionProgress[P]>
  }




  export type KafkaProjectionProgressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KafkaProjectionProgressWhereInput
    orderBy?: KafkaProjectionProgressOrderByWithAggregationInput | KafkaProjectionProgressOrderByWithAggregationInput[]
    by: KafkaProjectionProgressScalarFieldEnum[] | KafkaProjectionProgressScalarFieldEnum
    having?: KafkaProjectionProgressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KafkaProjectionProgressCountAggregateInputType | true
    _avg?: KafkaProjectionProgressAvgAggregateInputType
    _sum?: KafkaProjectionProgressSumAggregateInputType
    _min?: KafkaProjectionProgressMinAggregateInputType
    _max?: KafkaProjectionProgressMaxAggregateInputType
  }

  export type KafkaProjectionProgressGroupByOutputType = {
    id: string
    consumerGroup: string
    topic: string
    partition: number
    lastOffset: bigint
    lastEventAt: Date
    updatedAt: Date
    _count: KafkaProjectionProgressCountAggregateOutputType | null
    _avg: KafkaProjectionProgressAvgAggregateOutputType | null
    _sum: KafkaProjectionProgressSumAggregateOutputType | null
    _min: KafkaProjectionProgressMinAggregateOutputType | null
    _max: KafkaProjectionProgressMaxAggregateOutputType | null
  }

  type GetKafkaProjectionProgressGroupByPayload<T extends KafkaProjectionProgressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KafkaProjectionProgressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KafkaProjectionProgressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KafkaProjectionProgressGroupByOutputType[P]>
            : GetScalarType<T[P], KafkaProjectionProgressGroupByOutputType[P]>
        }
      >
    >


  export type KafkaProjectionProgressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consumerGroup?: boolean
    topic?: boolean
    partition?: boolean
    lastOffset?: boolean
    lastEventAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["kafkaProjectionProgress"]>

  export type KafkaProjectionProgressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    consumerGroup?: boolean
    topic?: boolean
    partition?: boolean
    lastOffset?: boolean
    lastEventAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["kafkaProjectionProgress"]>

  export type KafkaProjectionProgressSelectScalar = {
    id?: boolean
    consumerGroup?: boolean
    topic?: boolean
    partition?: boolean
    lastOffset?: boolean
    lastEventAt?: boolean
    updatedAt?: boolean
  }


  export type $KafkaProjectionProgressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KafkaProjectionProgress"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      consumerGroup: string
      topic: string
      partition: number
      lastOffset: bigint
      lastEventAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["kafkaProjectionProgress"]>
    composites: {}
  }

  type KafkaProjectionProgressGetPayload<S extends boolean | null | undefined | KafkaProjectionProgressDefaultArgs> = $Result.GetResult<Prisma.$KafkaProjectionProgressPayload, S>

  type KafkaProjectionProgressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<KafkaProjectionProgressFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: KafkaProjectionProgressCountAggregateInputType | true
    }

  export interface KafkaProjectionProgressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KafkaProjectionProgress'], meta: { name: 'KafkaProjectionProgress' } }
    /**
     * Find zero or one KafkaProjectionProgress that matches the filter.
     * @param {KafkaProjectionProgressFindUniqueArgs} args - Arguments to find a KafkaProjectionProgress
     * @example
     * // Get one KafkaProjectionProgress
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KafkaProjectionProgressFindUniqueArgs>(args: SelectSubset<T, KafkaProjectionProgressFindUniqueArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one KafkaProjectionProgress that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {KafkaProjectionProgressFindUniqueOrThrowArgs} args - Arguments to find a KafkaProjectionProgress
     * @example
     * // Get one KafkaProjectionProgress
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KafkaProjectionProgressFindUniqueOrThrowArgs>(args: SelectSubset<T, KafkaProjectionProgressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first KafkaProjectionProgress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressFindFirstArgs} args - Arguments to find a KafkaProjectionProgress
     * @example
     * // Get one KafkaProjectionProgress
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KafkaProjectionProgressFindFirstArgs>(args?: SelectSubset<T, KafkaProjectionProgressFindFirstArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first KafkaProjectionProgress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressFindFirstOrThrowArgs} args - Arguments to find a KafkaProjectionProgress
     * @example
     * // Get one KafkaProjectionProgress
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KafkaProjectionProgressFindFirstOrThrowArgs>(args?: SelectSubset<T, KafkaProjectionProgressFindFirstOrThrowArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more KafkaProjectionProgresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KafkaProjectionProgresses
     * const kafkaProjectionProgresses = await prisma.kafkaProjectionProgress.findMany()
     * 
     * // Get first 10 KafkaProjectionProgresses
     * const kafkaProjectionProgresses = await prisma.kafkaProjectionProgress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const kafkaProjectionProgressWithIdOnly = await prisma.kafkaProjectionProgress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KafkaProjectionProgressFindManyArgs>(args?: SelectSubset<T, KafkaProjectionProgressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a KafkaProjectionProgress.
     * @param {KafkaProjectionProgressCreateArgs} args - Arguments to create a KafkaProjectionProgress.
     * @example
     * // Create one KafkaProjectionProgress
     * const KafkaProjectionProgress = await prisma.kafkaProjectionProgress.create({
     *   data: {
     *     // ... data to create a KafkaProjectionProgress
     *   }
     * })
     * 
     */
    create<T extends KafkaProjectionProgressCreateArgs>(args: SelectSubset<T, KafkaProjectionProgressCreateArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many KafkaProjectionProgresses.
     * @param {KafkaProjectionProgressCreateManyArgs} args - Arguments to create many KafkaProjectionProgresses.
     * @example
     * // Create many KafkaProjectionProgresses
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KafkaProjectionProgressCreateManyArgs>(args?: SelectSubset<T, KafkaProjectionProgressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KafkaProjectionProgresses and returns the data saved in the database.
     * @param {KafkaProjectionProgressCreateManyAndReturnArgs} args - Arguments to create many KafkaProjectionProgresses.
     * @example
     * // Create many KafkaProjectionProgresses
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KafkaProjectionProgresses and only return the `id`
     * const kafkaProjectionProgressWithIdOnly = await prisma.kafkaProjectionProgress.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KafkaProjectionProgressCreateManyAndReturnArgs>(args?: SelectSubset<T, KafkaProjectionProgressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a KafkaProjectionProgress.
     * @param {KafkaProjectionProgressDeleteArgs} args - Arguments to delete one KafkaProjectionProgress.
     * @example
     * // Delete one KafkaProjectionProgress
     * const KafkaProjectionProgress = await prisma.kafkaProjectionProgress.delete({
     *   where: {
     *     // ... filter to delete one KafkaProjectionProgress
     *   }
     * })
     * 
     */
    delete<T extends KafkaProjectionProgressDeleteArgs>(args: SelectSubset<T, KafkaProjectionProgressDeleteArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one KafkaProjectionProgress.
     * @param {KafkaProjectionProgressUpdateArgs} args - Arguments to update one KafkaProjectionProgress.
     * @example
     * // Update one KafkaProjectionProgress
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KafkaProjectionProgressUpdateArgs>(args: SelectSubset<T, KafkaProjectionProgressUpdateArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more KafkaProjectionProgresses.
     * @param {KafkaProjectionProgressDeleteManyArgs} args - Arguments to filter KafkaProjectionProgresses to delete.
     * @example
     * // Delete a few KafkaProjectionProgresses
     * const { count } = await prisma.kafkaProjectionProgress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KafkaProjectionProgressDeleteManyArgs>(args?: SelectSubset<T, KafkaProjectionProgressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KafkaProjectionProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KafkaProjectionProgresses
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KafkaProjectionProgressUpdateManyArgs>(args: SelectSubset<T, KafkaProjectionProgressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one KafkaProjectionProgress.
     * @param {KafkaProjectionProgressUpsertArgs} args - Arguments to update or create a KafkaProjectionProgress.
     * @example
     * // Update or create a KafkaProjectionProgress
     * const kafkaProjectionProgress = await prisma.kafkaProjectionProgress.upsert({
     *   create: {
     *     // ... data to create a KafkaProjectionProgress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KafkaProjectionProgress we want to update
     *   }
     * })
     */
    upsert<T extends KafkaProjectionProgressUpsertArgs>(args: SelectSubset<T, KafkaProjectionProgressUpsertArgs<ExtArgs>>): Prisma__KafkaProjectionProgressClient<$Result.GetResult<Prisma.$KafkaProjectionProgressPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of KafkaProjectionProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressCountArgs} args - Arguments to filter KafkaProjectionProgresses to count.
     * @example
     * // Count the number of KafkaProjectionProgresses
     * const count = await prisma.kafkaProjectionProgress.count({
     *   where: {
     *     // ... the filter for the KafkaProjectionProgresses we want to count
     *   }
     * })
    **/
    count<T extends KafkaProjectionProgressCountArgs>(
      args?: Subset<T, KafkaProjectionProgressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KafkaProjectionProgressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KafkaProjectionProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends KafkaProjectionProgressAggregateArgs>(args: Subset<T, KafkaProjectionProgressAggregateArgs>): Prisma.PrismaPromise<GetKafkaProjectionProgressAggregateType<T>>

    /**
     * Group by KafkaProjectionProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KafkaProjectionProgressGroupByArgs} args - Group by arguments.
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
      T extends KafkaProjectionProgressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KafkaProjectionProgressGroupByArgs['orderBy'] }
        : { orderBy?: KafkaProjectionProgressGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, KafkaProjectionProgressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKafkaProjectionProgressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KafkaProjectionProgress model
   */
  readonly fields: KafkaProjectionProgressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KafkaProjectionProgress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KafkaProjectionProgressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the KafkaProjectionProgress model
   */ 
  interface KafkaProjectionProgressFieldRefs {
    readonly id: FieldRef<"KafkaProjectionProgress", 'String'>
    readonly consumerGroup: FieldRef<"KafkaProjectionProgress", 'String'>
    readonly topic: FieldRef<"KafkaProjectionProgress", 'String'>
    readonly partition: FieldRef<"KafkaProjectionProgress", 'Int'>
    readonly lastOffset: FieldRef<"KafkaProjectionProgress", 'BigInt'>
    readonly lastEventAt: FieldRef<"KafkaProjectionProgress", 'DateTime'>
    readonly updatedAt: FieldRef<"KafkaProjectionProgress", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * KafkaProjectionProgress findUnique
   */
  export type KafkaProjectionProgressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * Filter, which KafkaProjectionProgress to fetch.
     */
    where: KafkaProjectionProgressWhereUniqueInput
  }

  /**
   * KafkaProjectionProgress findUniqueOrThrow
   */
  export type KafkaProjectionProgressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * Filter, which KafkaProjectionProgress to fetch.
     */
    where: KafkaProjectionProgressWhereUniqueInput
  }

  /**
   * KafkaProjectionProgress findFirst
   */
  export type KafkaProjectionProgressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * Filter, which KafkaProjectionProgress to fetch.
     */
    where?: KafkaProjectionProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KafkaProjectionProgresses to fetch.
     */
    orderBy?: KafkaProjectionProgressOrderByWithRelationInput | KafkaProjectionProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KafkaProjectionProgresses.
     */
    cursor?: KafkaProjectionProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KafkaProjectionProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KafkaProjectionProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KafkaProjectionProgresses.
     */
    distinct?: KafkaProjectionProgressScalarFieldEnum | KafkaProjectionProgressScalarFieldEnum[]
  }

  /**
   * KafkaProjectionProgress findFirstOrThrow
   */
  export type KafkaProjectionProgressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * Filter, which KafkaProjectionProgress to fetch.
     */
    where?: KafkaProjectionProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KafkaProjectionProgresses to fetch.
     */
    orderBy?: KafkaProjectionProgressOrderByWithRelationInput | KafkaProjectionProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KafkaProjectionProgresses.
     */
    cursor?: KafkaProjectionProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KafkaProjectionProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KafkaProjectionProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KafkaProjectionProgresses.
     */
    distinct?: KafkaProjectionProgressScalarFieldEnum | KafkaProjectionProgressScalarFieldEnum[]
  }

  /**
   * KafkaProjectionProgress findMany
   */
  export type KafkaProjectionProgressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * Filter, which KafkaProjectionProgresses to fetch.
     */
    where?: KafkaProjectionProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KafkaProjectionProgresses to fetch.
     */
    orderBy?: KafkaProjectionProgressOrderByWithRelationInput | KafkaProjectionProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KafkaProjectionProgresses.
     */
    cursor?: KafkaProjectionProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KafkaProjectionProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KafkaProjectionProgresses.
     */
    skip?: number
    distinct?: KafkaProjectionProgressScalarFieldEnum | KafkaProjectionProgressScalarFieldEnum[]
  }

  /**
   * KafkaProjectionProgress create
   */
  export type KafkaProjectionProgressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * The data needed to create a KafkaProjectionProgress.
     */
    data: XOR<KafkaProjectionProgressCreateInput, KafkaProjectionProgressUncheckedCreateInput>
  }

  /**
   * KafkaProjectionProgress createMany
   */
  export type KafkaProjectionProgressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KafkaProjectionProgresses.
     */
    data: KafkaProjectionProgressCreateManyInput | KafkaProjectionProgressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KafkaProjectionProgress createManyAndReturn
   */
  export type KafkaProjectionProgressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many KafkaProjectionProgresses.
     */
    data: KafkaProjectionProgressCreateManyInput | KafkaProjectionProgressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KafkaProjectionProgress update
   */
  export type KafkaProjectionProgressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * The data needed to update a KafkaProjectionProgress.
     */
    data: XOR<KafkaProjectionProgressUpdateInput, KafkaProjectionProgressUncheckedUpdateInput>
    /**
     * Choose, which KafkaProjectionProgress to update.
     */
    where: KafkaProjectionProgressWhereUniqueInput
  }

  /**
   * KafkaProjectionProgress updateMany
   */
  export type KafkaProjectionProgressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KafkaProjectionProgresses.
     */
    data: XOR<KafkaProjectionProgressUpdateManyMutationInput, KafkaProjectionProgressUncheckedUpdateManyInput>
    /**
     * Filter which KafkaProjectionProgresses to update
     */
    where?: KafkaProjectionProgressWhereInput
  }

  /**
   * KafkaProjectionProgress upsert
   */
  export type KafkaProjectionProgressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * The filter to search for the KafkaProjectionProgress to update in case it exists.
     */
    where: KafkaProjectionProgressWhereUniqueInput
    /**
     * In case the KafkaProjectionProgress found by the `where` argument doesn't exist, create a new KafkaProjectionProgress with this data.
     */
    create: XOR<KafkaProjectionProgressCreateInput, KafkaProjectionProgressUncheckedCreateInput>
    /**
     * In case the KafkaProjectionProgress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KafkaProjectionProgressUpdateInput, KafkaProjectionProgressUncheckedUpdateInput>
  }

  /**
   * KafkaProjectionProgress delete
   */
  export type KafkaProjectionProgressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
    /**
     * Filter which KafkaProjectionProgress to delete.
     */
    where: KafkaProjectionProgressWhereUniqueInput
  }

  /**
   * KafkaProjectionProgress deleteMany
   */
  export type KafkaProjectionProgressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KafkaProjectionProgresses to delete
     */
    where?: KafkaProjectionProgressWhereInput
  }

  /**
   * KafkaProjectionProgress without action
   */
  export type KafkaProjectionProgressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KafkaProjectionProgress
     */
    select?: KafkaProjectionProgressSelect<ExtArgs> | null
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


  export const DailySalesReportScalarFieldEnum: {
    id: 'id',
    date: 'date',
    totalOrders: 'totalOrders',
    totalCompletedOrders: 'totalCompletedOrders',
    totalCancelledOrders: 'totalCancelledOrders',
    totalRevenue: 'totalRevenue',
    totalItemsSold: 'totalItemsSold',
    averageOrderValue: 'averageOrderValue',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DailySalesReportScalarFieldEnum = (typeof DailySalesReportScalarFieldEnum)[keyof typeof DailySalesReportScalarFieldEnum]


  export const MonthlySalesReportScalarFieldEnum: {
    id: 'id',
    year: 'year',
    month: 'month',
    totalOrders: 'totalOrders',
    totalCompletedOrders: 'totalCompletedOrders',
    totalCancelledOrders: 'totalCancelledOrders',
    totalRevenue: 'totalRevenue',
    totalItemsSold: 'totalItemsSold',
    averageOrderValue: 'averageOrderValue',
    newCustomers: 'newCustomers',
    newSellers: 'newSellers',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MonthlySalesReportScalarFieldEnum = (typeof MonthlySalesReportScalarFieldEnum)[keyof typeof MonthlySalesReportScalarFieldEnum]


  export const ProductSalesReportScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    productName: 'productName',
    sellerId: 'sellerId',
    sellerName: 'sellerName',
    categoryId: 'categoryId',
    categoryName: 'categoryName',
    totalUnitsSold: 'totalUnitsSold',
    totalRevenue: 'totalRevenue',
    totalOrders: 'totalOrders',
    averageRating: 'averageRating',
    periodType: 'periodType',
    periodDate: 'periodDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductSalesReportScalarFieldEnum = (typeof ProductSalesReportScalarFieldEnum)[keyof typeof ProductSalesReportScalarFieldEnum]


  export const SellerPerformanceReportScalarFieldEnum: {
    id: 'id',
    sellerId: 'sellerId',
    sellerName: 'sellerName',
    totalProducts: 'totalProducts',
    totalOrders: 'totalOrders',
    totalRevenue: 'totalRevenue',
    totalItemsSold: 'totalItemsSold',
    totalCancelled: 'totalCancelled',
    averageRating: 'averageRating',
    totalReviews: 'totalReviews',
    cancellationRate: 'cancellationRate',
    periodType: 'periodType',
    periodDate: 'periodDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SellerPerformanceReportScalarFieldEnum = (typeof SellerPerformanceReportScalarFieldEnum)[keyof typeof SellerPerformanceReportScalarFieldEnum]


  export const PaymentReportScalarFieldEnum: {
    id: 'id',
    date: 'date',
    totalTransactions: 'totalTransactions',
    successCount: 'successCount',
    failedCount: 'failedCount',
    expiredCount: 'expiredCount',
    successRate: 'successRate',
    totalAmount: 'totalAmount',
    averageAmount: 'averageAmount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PaymentReportScalarFieldEnum = (typeof PaymentReportScalarFieldEnum)[keyof typeof PaymentReportScalarFieldEnum]


  export const CategoryPerformanceReportScalarFieldEnum: {
    id: 'id',
    categoryId: 'categoryId',
    categoryName: 'categoryName',
    totalProducts: 'totalProducts',
    totalOrders: 'totalOrders',
    totalRevenue: 'totalRevenue',
    totalUnitsSold: 'totalUnitsSold',
    periodType: 'periodType',
    periodDate: 'periodDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CategoryPerformanceReportScalarFieldEnum = (typeof CategoryPerformanceReportScalarFieldEnum)[keyof typeof CategoryPerformanceReportScalarFieldEnum]


  export const AnalyticsEventScalarFieldEnum: {
    id: 'id',
    eventId: 'eventId',
    eventName: 'eventName',
    eventData: 'eventData',
    processedAt: 'processedAt',
    isProcessed: 'isProcessed',
    createdAt: 'createdAt'
  };

  export type AnalyticsEventScalarFieldEnum = (typeof AnalyticsEventScalarFieldEnum)[keyof typeof AnalyticsEventScalarFieldEnum]


  export const InboxEventScalarFieldEnum: {
    id: 'id',
    eventId: 'eventId',
    consumer: 'consumer',
    eventName: 'eventName',
    payload: 'payload',
    status: 'status',
    attempts: 'attempts',
    lastError: 'lastError',
    processedAt: 'processedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InboxEventScalarFieldEnum = (typeof InboxEventScalarFieldEnum)[keyof typeof InboxEventScalarFieldEnum]


  export const DailySalesProjectionScalarFieldEnum: {
    id: 'id',
    date: 'date',
    totalOrders: 'totalOrders',
    totalCompletedOrders: 'totalCompletedOrders',
    totalCancelledOrders: 'totalCancelledOrders',
    totalRevenue: 'totalRevenue',
    totalItemsSold: 'totalItemsSold',
    updatedAt: 'updatedAt'
  };

  export type DailySalesProjectionScalarFieldEnum = (typeof DailySalesProjectionScalarFieldEnum)[keyof typeof DailySalesProjectionScalarFieldEnum]


  export const KafkaProjectionProgressScalarFieldEnum: {
    id: 'id',
    consumerGroup: 'consumerGroup',
    topic: 'topic',
    partition: 'partition',
    lastOffset: 'lastOffset',
    lastEventAt: 'lastEventAt',
    updatedAt: 'updatedAt'
  };

  export type KafkaProjectionProgressScalarFieldEnum = (typeof KafkaProjectionProgressScalarFieldEnum)[keyof typeof KafkaProjectionProgressScalarFieldEnum]


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


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    
  /**
   * Deep Input Types
   */


  export type DailySalesReportWhereInput = {
    AND?: DailySalesReportWhereInput | DailySalesReportWhereInput[]
    OR?: DailySalesReportWhereInput[]
    NOT?: DailySalesReportWhereInput | DailySalesReportWhereInput[]
    id?: StringFilter<"DailySalesReport"> | string
    date?: DateTimeFilter<"DailySalesReport"> | Date | string
    totalOrders?: IntFilter<"DailySalesReport"> | number
    totalCompletedOrders?: IntFilter<"DailySalesReport"> | number
    totalCancelledOrders?: IntFilter<"DailySalesReport"> | number
    totalRevenue?: DecimalFilter<"DailySalesReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"DailySalesReport"> | number
    averageOrderValue?: DecimalFilter<"DailySalesReport"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"DailySalesReport"> | Date | string
    updatedAt?: DateTimeFilter<"DailySalesReport"> | Date | string
  }

  export type DailySalesReportOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: DailySalesReportWhereInput | DailySalesReportWhereInput[]
    OR?: DailySalesReportWhereInput[]
    NOT?: DailySalesReportWhereInput | DailySalesReportWhereInput[]
    totalOrders?: IntFilter<"DailySalesReport"> | number
    totalCompletedOrders?: IntFilter<"DailySalesReport"> | number
    totalCancelledOrders?: IntFilter<"DailySalesReport"> | number
    totalRevenue?: DecimalFilter<"DailySalesReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"DailySalesReport"> | number
    averageOrderValue?: DecimalFilter<"DailySalesReport"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"DailySalesReport"> | Date | string
    updatedAt?: DateTimeFilter<"DailySalesReport"> | Date | string
  }, "id" | "date">

  export type DailySalesReportOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DailySalesReportCountOrderByAggregateInput
    _avg?: DailySalesReportAvgOrderByAggregateInput
    _max?: DailySalesReportMaxOrderByAggregateInput
    _min?: DailySalesReportMinOrderByAggregateInput
    _sum?: DailySalesReportSumOrderByAggregateInput
  }

  export type DailySalesReportScalarWhereWithAggregatesInput = {
    AND?: DailySalesReportScalarWhereWithAggregatesInput | DailySalesReportScalarWhereWithAggregatesInput[]
    OR?: DailySalesReportScalarWhereWithAggregatesInput[]
    NOT?: DailySalesReportScalarWhereWithAggregatesInput | DailySalesReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailySalesReport"> | string
    date?: DateTimeWithAggregatesFilter<"DailySalesReport"> | Date | string
    totalOrders?: IntWithAggregatesFilter<"DailySalesReport"> | number
    totalCompletedOrders?: IntWithAggregatesFilter<"DailySalesReport"> | number
    totalCancelledOrders?: IntWithAggregatesFilter<"DailySalesReport"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"DailySalesReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntWithAggregatesFilter<"DailySalesReport"> | number
    averageOrderValue?: DecimalWithAggregatesFilter<"DailySalesReport"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"DailySalesReport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DailySalesReport"> | Date | string
  }

  export type MonthlySalesReportWhereInput = {
    AND?: MonthlySalesReportWhereInput | MonthlySalesReportWhereInput[]
    OR?: MonthlySalesReportWhereInput[]
    NOT?: MonthlySalesReportWhereInput | MonthlySalesReportWhereInput[]
    id?: StringFilter<"MonthlySalesReport"> | string
    year?: IntFilter<"MonthlySalesReport"> | number
    month?: IntFilter<"MonthlySalesReport"> | number
    totalOrders?: IntFilter<"MonthlySalesReport"> | number
    totalCompletedOrders?: IntFilter<"MonthlySalesReport"> | number
    totalCancelledOrders?: IntFilter<"MonthlySalesReport"> | number
    totalRevenue?: DecimalFilter<"MonthlySalesReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"MonthlySalesReport"> | number
    averageOrderValue?: DecimalFilter<"MonthlySalesReport"> | Decimal | DecimalJsLike | number | string
    newCustomers?: IntFilter<"MonthlySalesReport"> | number
    newSellers?: IntFilter<"MonthlySalesReport"> | number
    createdAt?: DateTimeFilter<"MonthlySalesReport"> | Date | string
    updatedAt?: DateTimeFilter<"MonthlySalesReport"> | Date | string
  }

  export type MonthlySalesReportOrderByWithRelationInput = {
    id?: SortOrder
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MonthlySalesReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    year_month?: MonthlySalesReportYearMonthCompoundUniqueInput
    AND?: MonthlySalesReportWhereInput | MonthlySalesReportWhereInput[]
    OR?: MonthlySalesReportWhereInput[]
    NOT?: MonthlySalesReportWhereInput | MonthlySalesReportWhereInput[]
    year?: IntFilter<"MonthlySalesReport"> | number
    month?: IntFilter<"MonthlySalesReport"> | number
    totalOrders?: IntFilter<"MonthlySalesReport"> | number
    totalCompletedOrders?: IntFilter<"MonthlySalesReport"> | number
    totalCancelledOrders?: IntFilter<"MonthlySalesReport"> | number
    totalRevenue?: DecimalFilter<"MonthlySalesReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"MonthlySalesReport"> | number
    averageOrderValue?: DecimalFilter<"MonthlySalesReport"> | Decimal | DecimalJsLike | number | string
    newCustomers?: IntFilter<"MonthlySalesReport"> | number
    newSellers?: IntFilter<"MonthlySalesReport"> | number
    createdAt?: DateTimeFilter<"MonthlySalesReport"> | Date | string
    updatedAt?: DateTimeFilter<"MonthlySalesReport"> | Date | string
  }, "id" | "year_month">

  export type MonthlySalesReportOrderByWithAggregationInput = {
    id?: SortOrder
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MonthlySalesReportCountOrderByAggregateInput
    _avg?: MonthlySalesReportAvgOrderByAggregateInput
    _max?: MonthlySalesReportMaxOrderByAggregateInput
    _min?: MonthlySalesReportMinOrderByAggregateInput
    _sum?: MonthlySalesReportSumOrderByAggregateInput
  }

  export type MonthlySalesReportScalarWhereWithAggregatesInput = {
    AND?: MonthlySalesReportScalarWhereWithAggregatesInput | MonthlySalesReportScalarWhereWithAggregatesInput[]
    OR?: MonthlySalesReportScalarWhereWithAggregatesInput[]
    NOT?: MonthlySalesReportScalarWhereWithAggregatesInput | MonthlySalesReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MonthlySalesReport"> | string
    year?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    month?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    totalOrders?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    totalCompletedOrders?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    totalCancelledOrders?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"MonthlySalesReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    averageOrderValue?: DecimalWithAggregatesFilter<"MonthlySalesReport"> | Decimal | DecimalJsLike | number | string
    newCustomers?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    newSellers?: IntWithAggregatesFilter<"MonthlySalesReport"> | number
    createdAt?: DateTimeWithAggregatesFilter<"MonthlySalesReport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MonthlySalesReport"> | Date | string
  }

  export type ProductSalesReportWhereInput = {
    AND?: ProductSalesReportWhereInput | ProductSalesReportWhereInput[]
    OR?: ProductSalesReportWhereInput[]
    NOT?: ProductSalesReportWhereInput | ProductSalesReportWhereInput[]
    id?: StringFilter<"ProductSalesReport"> | string
    productId?: StringFilter<"ProductSalesReport"> | string
    productName?: StringFilter<"ProductSalesReport"> | string
    sellerId?: StringFilter<"ProductSalesReport"> | string
    sellerName?: StringFilter<"ProductSalesReport"> | string
    categoryId?: StringNullableFilter<"ProductSalesReport"> | string | null
    categoryName?: StringNullableFilter<"ProductSalesReport"> | string | null
    totalUnitsSold?: IntFilter<"ProductSalesReport"> | number
    totalRevenue?: DecimalFilter<"ProductSalesReport"> | Decimal | DecimalJsLike | number | string
    totalOrders?: IntFilter<"ProductSalesReport"> | number
    averageRating?: FloatFilter<"ProductSalesReport"> | number
    periodType?: StringFilter<"ProductSalesReport"> | string
    periodDate?: DateTimeNullableFilter<"ProductSalesReport"> | Date | string | null
    createdAt?: DateTimeFilter<"ProductSalesReport"> | Date | string
    updatedAt?: DateTimeFilter<"ProductSalesReport"> | Date | string
  }

  export type ProductSalesReportOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    categoryName?: SortOrderInput | SortOrder
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSalesReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productId_periodType_periodDate?: ProductSalesReportProductIdPeriodTypePeriodDateCompoundUniqueInput
    AND?: ProductSalesReportWhereInput | ProductSalesReportWhereInput[]
    OR?: ProductSalesReportWhereInput[]
    NOT?: ProductSalesReportWhereInput | ProductSalesReportWhereInput[]
    productId?: StringFilter<"ProductSalesReport"> | string
    productName?: StringFilter<"ProductSalesReport"> | string
    sellerId?: StringFilter<"ProductSalesReport"> | string
    sellerName?: StringFilter<"ProductSalesReport"> | string
    categoryId?: StringNullableFilter<"ProductSalesReport"> | string | null
    categoryName?: StringNullableFilter<"ProductSalesReport"> | string | null
    totalUnitsSold?: IntFilter<"ProductSalesReport"> | number
    totalRevenue?: DecimalFilter<"ProductSalesReport"> | Decimal | DecimalJsLike | number | string
    totalOrders?: IntFilter<"ProductSalesReport"> | number
    averageRating?: FloatFilter<"ProductSalesReport"> | number
    periodType?: StringFilter<"ProductSalesReport"> | string
    periodDate?: DateTimeNullableFilter<"ProductSalesReport"> | Date | string | null
    createdAt?: DateTimeFilter<"ProductSalesReport"> | Date | string
    updatedAt?: DateTimeFilter<"ProductSalesReport"> | Date | string
  }, "id" | "productId_periodType_periodDate">

  export type ProductSalesReportOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    categoryName?: SortOrderInput | SortOrder
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductSalesReportCountOrderByAggregateInput
    _avg?: ProductSalesReportAvgOrderByAggregateInput
    _max?: ProductSalesReportMaxOrderByAggregateInput
    _min?: ProductSalesReportMinOrderByAggregateInput
    _sum?: ProductSalesReportSumOrderByAggregateInput
  }

  export type ProductSalesReportScalarWhereWithAggregatesInput = {
    AND?: ProductSalesReportScalarWhereWithAggregatesInput | ProductSalesReportScalarWhereWithAggregatesInput[]
    OR?: ProductSalesReportScalarWhereWithAggregatesInput[]
    NOT?: ProductSalesReportScalarWhereWithAggregatesInput | ProductSalesReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProductSalesReport"> | string
    productId?: StringWithAggregatesFilter<"ProductSalesReport"> | string
    productName?: StringWithAggregatesFilter<"ProductSalesReport"> | string
    sellerId?: StringWithAggregatesFilter<"ProductSalesReport"> | string
    sellerName?: StringWithAggregatesFilter<"ProductSalesReport"> | string
    categoryId?: StringNullableWithAggregatesFilter<"ProductSalesReport"> | string | null
    categoryName?: StringNullableWithAggregatesFilter<"ProductSalesReport"> | string | null
    totalUnitsSold?: IntWithAggregatesFilter<"ProductSalesReport"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"ProductSalesReport"> | Decimal | DecimalJsLike | number | string
    totalOrders?: IntWithAggregatesFilter<"ProductSalesReport"> | number
    averageRating?: FloatWithAggregatesFilter<"ProductSalesReport"> | number
    periodType?: StringWithAggregatesFilter<"ProductSalesReport"> | string
    periodDate?: DateTimeNullableWithAggregatesFilter<"ProductSalesReport"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ProductSalesReport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ProductSalesReport"> | Date | string
  }

  export type SellerPerformanceReportWhereInput = {
    AND?: SellerPerformanceReportWhereInput | SellerPerformanceReportWhereInput[]
    OR?: SellerPerformanceReportWhereInput[]
    NOT?: SellerPerformanceReportWhereInput | SellerPerformanceReportWhereInput[]
    id?: StringFilter<"SellerPerformanceReport"> | string
    sellerId?: StringFilter<"SellerPerformanceReport"> | string
    sellerName?: StringFilter<"SellerPerformanceReport"> | string
    totalProducts?: IntFilter<"SellerPerformanceReport"> | number
    totalOrders?: IntFilter<"SellerPerformanceReport"> | number
    totalRevenue?: DecimalFilter<"SellerPerformanceReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"SellerPerformanceReport"> | number
    totalCancelled?: IntFilter<"SellerPerformanceReport"> | number
    averageRating?: FloatFilter<"SellerPerformanceReport"> | number
    totalReviews?: IntFilter<"SellerPerformanceReport"> | number
    cancellationRate?: FloatFilter<"SellerPerformanceReport"> | number
    periodType?: StringFilter<"SellerPerformanceReport"> | string
    periodDate?: DateTimeNullableFilter<"SellerPerformanceReport"> | Date | string | null
    createdAt?: DateTimeFilter<"SellerPerformanceReport"> | Date | string
    updatedAt?: DateTimeFilter<"SellerPerformanceReport"> | Date | string
  }

  export type SellerPerformanceReportOrderByWithRelationInput = {
    id?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SellerPerformanceReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sellerId_periodType_periodDate?: SellerPerformanceReportSellerIdPeriodTypePeriodDateCompoundUniqueInput
    AND?: SellerPerformanceReportWhereInput | SellerPerformanceReportWhereInput[]
    OR?: SellerPerformanceReportWhereInput[]
    NOT?: SellerPerformanceReportWhereInput | SellerPerformanceReportWhereInput[]
    sellerId?: StringFilter<"SellerPerformanceReport"> | string
    sellerName?: StringFilter<"SellerPerformanceReport"> | string
    totalProducts?: IntFilter<"SellerPerformanceReport"> | number
    totalOrders?: IntFilter<"SellerPerformanceReport"> | number
    totalRevenue?: DecimalFilter<"SellerPerformanceReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"SellerPerformanceReport"> | number
    totalCancelled?: IntFilter<"SellerPerformanceReport"> | number
    averageRating?: FloatFilter<"SellerPerformanceReport"> | number
    totalReviews?: IntFilter<"SellerPerformanceReport"> | number
    cancellationRate?: FloatFilter<"SellerPerformanceReport"> | number
    periodType?: StringFilter<"SellerPerformanceReport"> | string
    periodDate?: DateTimeNullableFilter<"SellerPerformanceReport"> | Date | string | null
    createdAt?: DateTimeFilter<"SellerPerformanceReport"> | Date | string
    updatedAt?: DateTimeFilter<"SellerPerformanceReport"> | Date | string
  }, "id" | "sellerId_periodType_periodDate">

  export type SellerPerformanceReportOrderByWithAggregationInput = {
    id?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SellerPerformanceReportCountOrderByAggregateInput
    _avg?: SellerPerformanceReportAvgOrderByAggregateInput
    _max?: SellerPerformanceReportMaxOrderByAggregateInput
    _min?: SellerPerformanceReportMinOrderByAggregateInput
    _sum?: SellerPerformanceReportSumOrderByAggregateInput
  }

  export type SellerPerformanceReportScalarWhereWithAggregatesInput = {
    AND?: SellerPerformanceReportScalarWhereWithAggregatesInput | SellerPerformanceReportScalarWhereWithAggregatesInput[]
    OR?: SellerPerformanceReportScalarWhereWithAggregatesInput[]
    NOT?: SellerPerformanceReportScalarWhereWithAggregatesInput | SellerPerformanceReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SellerPerformanceReport"> | string
    sellerId?: StringWithAggregatesFilter<"SellerPerformanceReport"> | string
    sellerName?: StringWithAggregatesFilter<"SellerPerformanceReport"> | string
    totalProducts?: IntWithAggregatesFilter<"SellerPerformanceReport"> | number
    totalOrders?: IntWithAggregatesFilter<"SellerPerformanceReport"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"SellerPerformanceReport"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntWithAggregatesFilter<"SellerPerformanceReport"> | number
    totalCancelled?: IntWithAggregatesFilter<"SellerPerformanceReport"> | number
    averageRating?: FloatWithAggregatesFilter<"SellerPerformanceReport"> | number
    totalReviews?: IntWithAggregatesFilter<"SellerPerformanceReport"> | number
    cancellationRate?: FloatWithAggregatesFilter<"SellerPerformanceReport"> | number
    periodType?: StringWithAggregatesFilter<"SellerPerformanceReport"> | string
    periodDate?: DateTimeNullableWithAggregatesFilter<"SellerPerformanceReport"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SellerPerformanceReport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SellerPerformanceReport"> | Date | string
  }

  export type PaymentReportWhereInput = {
    AND?: PaymentReportWhereInput | PaymentReportWhereInput[]
    OR?: PaymentReportWhereInput[]
    NOT?: PaymentReportWhereInput | PaymentReportWhereInput[]
    id?: StringFilter<"PaymentReport"> | string
    date?: DateTimeFilter<"PaymentReport"> | Date | string
    totalTransactions?: IntFilter<"PaymentReport"> | number
    successCount?: IntFilter<"PaymentReport"> | number
    failedCount?: IntFilter<"PaymentReport"> | number
    expiredCount?: IntFilter<"PaymentReport"> | number
    successRate?: FloatFilter<"PaymentReport"> | number
    totalAmount?: DecimalFilter<"PaymentReport"> | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalFilter<"PaymentReport"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"PaymentReport"> | Date | string
    updatedAt?: DateTimeFilter<"PaymentReport"> | Date | string
  }

  export type PaymentReportOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: PaymentReportWhereInput | PaymentReportWhereInput[]
    OR?: PaymentReportWhereInput[]
    NOT?: PaymentReportWhereInput | PaymentReportWhereInput[]
    totalTransactions?: IntFilter<"PaymentReport"> | number
    successCount?: IntFilter<"PaymentReport"> | number
    failedCount?: IntFilter<"PaymentReport"> | number
    expiredCount?: IntFilter<"PaymentReport"> | number
    successRate?: FloatFilter<"PaymentReport"> | number
    totalAmount?: DecimalFilter<"PaymentReport"> | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalFilter<"PaymentReport"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"PaymentReport"> | Date | string
    updatedAt?: DateTimeFilter<"PaymentReport"> | Date | string
  }, "id" | "date">

  export type PaymentReportOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PaymentReportCountOrderByAggregateInput
    _avg?: PaymentReportAvgOrderByAggregateInput
    _max?: PaymentReportMaxOrderByAggregateInput
    _min?: PaymentReportMinOrderByAggregateInput
    _sum?: PaymentReportSumOrderByAggregateInput
  }

  export type PaymentReportScalarWhereWithAggregatesInput = {
    AND?: PaymentReportScalarWhereWithAggregatesInput | PaymentReportScalarWhereWithAggregatesInput[]
    OR?: PaymentReportScalarWhereWithAggregatesInput[]
    NOT?: PaymentReportScalarWhereWithAggregatesInput | PaymentReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PaymentReport"> | string
    date?: DateTimeWithAggregatesFilter<"PaymentReport"> | Date | string
    totalTransactions?: IntWithAggregatesFilter<"PaymentReport"> | number
    successCount?: IntWithAggregatesFilter<"PaymentReport"> | number
    failedCount?: IntWithAggregatesFilter<"PaymentReport"> | number
    expiredCount?: IntWithAggregatesFilter<"PaymentReport"> | number
    successRate?: FloatWithAggregatesFilter<"PaymentReport"> | number
    totalAmount?: DecimalWithAggregatesFilter<"PaymentReport"> | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalWithAggregatesFilter<"PaymentReport"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"PaymentReport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PaymentReport"> | Date | string
  }

  export type CategoryPerformanceReportWhereInput = {
    AND?: CategoryPerformanceReportWhereInput | CategoryPerformanceReportWhereInput[]
    OR?: CategoryPerformanceReportWhereInput[]
    NOT?: CategoryPerformanceReportWhereInput | CategoryPerformanceReportWhereInput[]
    id?: StringFilter<"CategoryPerformanceReport"> | string
    categoryId?: StringFilter<"CategoryPerformanceReport"> | string
    categoryName?: StringFilter<"CategoryPerformanceReport"> | string
    totalProducts?: IntFilter<"CategoryPerformanceReport"> | number
    totalOrders?: IntFilter<"CategoryPerformanceReport"> | number
    totalRevenue?: DecimalFilter<"CategoryPerformanceReport"> | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntFilter<"CategoryPerformanceReport"> | number
    periodType?: StringFilter<"CategoryPerformanceReport"> | string
    periodDate?: DateTimeNullableFilter<"CategoryPerformanceReport"> | Date | string | null
    createdAt?: DateTimeFilter<"CategoryPerformanceReport"> | Date | string
    updatedAt?: DateTimeFilter<"CategoryPerformanceReport"> | Date | string
  }

  export type CategoryPerformanceReportOrderByWithRelationInput = {
    id?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryPerformanceReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    categoryId_periodType_periodDate?: CategoryPerformanceReportCategoryIdPeriodTypePeriodDateCompoundUniqueInput
    AND?: CategoryPerformanceReportWhereInput | CategoryPerformanceReportWhereInput[]
    OR?: CategoryPerformanceReportWhereInput[]
    NOT?: CategoryPerformanceReportWhereInput | CategoryPerformanceReportWhereInput[]
    categoryId?: StringFilter<"CategoryPerformanceReport"> | string
    categoryName?: StringFilter<"CategoryPerformanceReport"> | string
    totalProducts?: IntFilter<"CategoryPerformanceReport"> | number
    totalOrders?: IntFilter<"CategoryPerformanceReport"> | number
    totalRevenue?: DecimalFilter<"CategoryPerformanceReport"> | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntFilter<"CategoryPerformanceReport"> | number
    periodType?: StringFilter<"CategoryPerformanceReport"> | string
    periodDate?: DateTimeNullableFilter<"CategoryPerformanceReport"> | Date | string | null
    createdAt?: DateTimeFilter<"CategoryPerformanceReport"> | Date | string
    updatedAt?: DateTimeFilter<"CategoryPerformanceReport"> | Date | string
  }, "id" | "categoryId_periodType_periodDate">

  export type CategoryPerformanceReportOrderByWithAggregationInput = {
    id?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CategoryPerformanceReportCountOrderByAggregateInput
    _avg?: CategoryPerformanceReportAvgOrderByAggregateInput
    _max?: CategoryPerformanceReportMaxOrderByAggregateInput
    _min?: CategoryPerformanceReportMinOrderByAggregateInput
    _sum?: CategoryPerformanceReportSumOrderByAggregateInput
  }

  export type CategoryPerformanceReportScalarWhereWithAggregatesInput = {
    AND?: CategoryPerformanceReportScalarWhereWithAggregatesInput | CategoryPerformanceReportScalarWhereWithAggregatesInput[]
    OR?: CategoryPerformanceReportScalarWhereWithAggregatesInput[]
    NOT?: CategoryPerformanceReportScalarWhereWithAggregatesInput | CategoryPerformanceReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CategoryPerformanceReport"> | string
    categoryId?: StringWithAggregatesFilter<"CategoryPerformanceReport"> | string
    categoryName?: StringWithAggregatesFilter<"CategoryPerformanceReport"> | string
    totalProducts?: IntWithAggregatesFilter<"CategoryPerformanceReport"> | number
    totalOrders?: IntWithAggregatesFilter<"CategoryPerformanceReport"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"CategoryPerformanceReport"> | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntWithAggregatesFilter<"CategoryPerformanceReport"> | number
    periodType?: StringWithAggregatesFilter<"CategoryPerformanceReport"> | string
    periodDate?: DateTimeNullableWithAggregatesFilter<"CategoryPerformanceReport"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CategoryPerformanceReport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CategoryPerformanceReport"> | Date | string
  }

  export type AnalyticsEventWhereInput = {
    AND?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    OR?: AnalyticsEventWhereInput[]
    NOT?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    id?: StringFilter<"AnalyticsEvent"> | string
    eventId?: StringNullableFilter<"AnalyticsEvent"> | string | null
    eventName?: StringFilter<"AnalyticsEvent"> | string
    eventData?: JsonFilter<"AnalyticsEvent">
    processedAt?: DateTimeNullableFilter<"AnalyticsEvent"> | Date | string | null
    isProcessed?: BoolFilter<"AnalyticsEvent"> | boolean
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string
  }

  export type AnalyticsEventOrderByWithRelationInput = {
    id?: SortOrder
    eventId?: SortOrderInput | SortOrder
    eventName?: SortOrder
    eventData?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    isProcessed?: SortOrder
    createdAt?: SortOrder
  }

  export type AnalyticsEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    eventId?: string
    AND?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    OR?: AnalyticsEventWhereInput[]
    NOT?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    eventName?: StringFilter<"AnalyticsEvent"> | string
    eventData?: JsonFilter<"AnalyticsEvent">
    processedAt?: DateTimeNullableFilter<"AnalyticsEvent"> | Date | string | null
    isProcessed?: BoolFilter<"AnalyticsEvent"> | boolean
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string
  }, "id" | "eventId">

  export type AnalyticsEventOrderByWithAggregationInput = {
    id?: SortOrder
    eventId?: SortOrderInput | SortOrder
    eventName?: SortOrder
    eventData?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    isProcessed?: SortOrder
    createdAt?: SortOrder
    _count?: AnalyticsEventCountOrderByAggregateInput
    _max?: AnalyticsEventMaxOrderByAggregateInput
    _min?: AnalyticsEventMinOrderByAggregateInput
  }

  export type AnalyticsEventScalarWhereWithAggregatesInput = {
    AND?: AnalyticsEventScalarWhereWithAggregatesInput | AnalyticsEventScalarWhereWithAggregatesInput[]
    OR?: AnalyticsEventScalarWhereWithAggregatesInput[]
    NOT?: AnalyticsEventScalarWhereWithAggregatesInput | AnalyticsEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AnalyticsEvent"> | string
    eventId?: StringNullableWithAggregatesFilter<"AnalyticsEvent"> | string | null
    eventName?: StringWithAggregatesFilter<"AnalyticsEvent"> | string
    eventData?: JsonWithAggregatesFilter<"AnalyticsEvent">
    processedAt?: DateTimeNullableWithAggregatesFilter<"AnalyticsEvent"> | Date | string | null
    isProcessed?: BoolWithAggregatesFilter<"AnalyticsEvent"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"AnalyticsEvent"> | Date | string
  }

  export type InboxEventWhereInput = {
    AND?: InboxEventWhereInput | InboxEventWhereInput[]
    OR?: InboxEventWhereInput[]
    NOT?: InboxEventWhereInput | InboxEventWhereInput[]
    id?: StringFilter<"InboxEvent"> | string
    eventId?: StringFilter<"InboxEvent"> | string
    consumer?: StringFilter<"InboxEvent"> | string
    eventName?: StringFilter<"InboxEvent"> | string
    payload?: JsonFilter<"InboxEvent">
    status?: StringFilter<"InboxEvent"> | string
    attempts?: IntFilter<"InboxEvent"> | number
    lastError?: StringNullableFilter<"InboxEvent"> | string | null
    processedAt?: DateTimeNullableFilter<"InboxEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"InboxEvent"> | Date | string
    updatedAt?: DateTimeFilter<"InboxEvent"> | Date | string
  }

  export type InboxEventOrderByWithRelationInput = {
    id?: SortOrder
    eventId?: SortOrder
    consumer?: SortOrder
    eventName?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrderInput | SortOrder
    processedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InboxEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    eventId_consumer?: InboxEventEventIdConsumerCompoundUniqueInput
    AND?: InboxEventWhereInput | InboxEventWhereInput[]
    OR?: InboxEventWhereInput[]
    NOT?: InboxEventWhereInput | InboxEventWhereInput[]
    eventId?: StringFilter<"InboxEvent"> | string
    consumer?: StringFilter<"InboxEvent"> | string
    eventName?: StringFilter<"InboxEvent"> | string
    payload?: JsonFilter<"InboxEvent">
    status?: StringFilter<"InboxEvent"> | string
    attempts?: IntFilter<"InboxEvent"> | number
    lastError?: StringNullableFilter<"InboxEvent"> | string | null
    processedAt?: DateTimeNullableFilter<"InboxEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"InboxEvent"> | Date | string
    updatedAt?: DateTimeFilter<"InboxEvent"> | Date | string
  }, "id" | "eventId_consumer">

  export type InboxEventOrderByWithAggregationInput = {
    id?: SortOrder
    eventId?: SortOrder
    consumer?: SortOrder
    eventName?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrderInput | SortOrder
    processedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InboxEventCountOrderByAggregateInput
    _avg?: InboxEventAvgOrderByAggregateInput
    _max?: InboxEventMaxOrderByAggregateInput
    _min?: InboxEventMinOrderByAggregateInput
    _sum?: InboxEventSumOrderByAggregateInput
  }

  export type InboxEventScalarWhereWithAggregatesInput = {
    AND?: InboxEventScalarWhereWithAggregatesInput | InboxEventScalarWhereWithAggregatesInput[]
    OR?: InboxEventScalarWhereWithAggregatesInput[]
    NOT?: InboxEventScalarWhereWithAggregatesInput | InboxEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InboxEvent"> | string
    eventId?: StringWithAggregatesFilter<"InboxEvent"> | string
    consumer?: StringWithAggregatesFilter<"InboxEvent"> | string
    eventName?: StringWithAggregatesFilter<"InboxEvent"> | string
    payload?: JsonWithAggregatesFilter<"InboxEvent">
    status?: StringWithAggregatesFilter<"InboxEvent"> | string
    attempts?: IntWithAggregatesFilter<"InboxEvent"> | number
    lastError?: StringNullableWithAggregatesFilter<"InboxEvent"> | string | null
    processedAt?: DateTimeNullableWithAggregatesFilter<"InboxEvent"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InboxEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InboxEvent"> | Date | string
  }

  export type DailySalesProjectionWhereInput = {
    AND?: DailySalesProjectionWhereInput | DailySalesProjectionWhereInput[]
    OR?: DailySalesProjectionWhereInput[]
    NOT?: DailySalesProjectionWhereInput | DailySalesProjectionWhereInput[]
    id?: StringFilter<"DailySalesProjection"> | string
    date?: DateTimeFilter<"DailySalesProjection"> | Date | string
    totalOrders?: IntFilter<"DailySalesProjection"> | number
    totalCompletedOrders?: IntFilter<"DailySalesProjection"> | number
    totalCancelledOrders?: IntFilter<"DailySalesProjection"> | number
    totalRevenue?: DecimalFilter<"DailySalesProjection"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"DailySalesProjection"> | number
    updatedAt?: DateTimeFilter<"DailySalesProjection"> | Date | string
  }

  export type DailySalesProjectionOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesProjectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: DailySalesProjectionWhereInput | DailySalesProjectionWhereInput[]
    OR?: DailySalesProjectionWhereInput[]
    NOT?: DailySalesProjectionWhereInput | DailySalesProjectionWhereInput[]
    totalOrders?: IntFilter<"DailySalesProjection"> | number
    totalCompletedOrders?: IntFilter<"DailySalesProjection"> | number
    totalCancelledOrders?: IntFilter<"DailySalesProjection"> | number
    totalRevenue?: DecimalFilter<"DailySalesProjection"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFilter<"DailySalesProjection"> | number
    updatedAt?: DateTimeFilter<"DailySalesProjection"> | Date | string
  }, "id" | "date">

  export type DailySalesProjectionOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    updatedAt?: SortOrder
    _count?: DailySalesProjectionCountOrderByAggregateInput
    _avg?: DailySalesProjectionAvgOrderByAggregateInput
    _max?: DailySalesProjectionMaxOrderByAggregateInput
    _min?: DailySalesProjectionMinOrderByAggregateInput
    _sum?: DailySalesProjectionSumOrderByAggregateInput
  }

  export type DailySalesProjectionScalarWhereWithAggregatesInput = {
    AND?: DailySalesProjectionScalarWhereWithAggregatesInput | DailySalesProjectionScalarWhereWithAggregatesInput[]
    OR?: DailySalesProjectionScalarWhereWithAggregatesInput[]
    NOT?: DailySalesProjectionScalarWhereWithAggregatesInput | DailySalesProjectionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailySalesProjection"> | string
    date?: DateTimeWithAggregatesFilter<"DailySalesProjection"> | Date | string
    totalOrders?: IntWithAggregatesFilter<"DailySalesProjection"> | number
    totalCompletedOrders?: IntWithAggregatesFilter<"DailySalesProjection"> | number
    totalCancelledOrders?: IntWithAggregatesFilter<"DailySalesProjection"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"DailySalesProjection"> | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntWithAggregatesFilter<"DailySalesProjection"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"DailySalesProjection"> | Date | string
  }

  export type KafkaProjectionProgressWhereInput = {
    AND?: KafkaProjectionProgressWhereInput | KafkaProjectionProgressWhereInput[]
    OR?: KafkaProjectionProgressWhereInput[]
    NOT?: KafkaProjectionProgressWhereInput | KafkaProjectionProgressWhereInput[]
    id?: StringFilter<"KafkaProjectionProgress"> | string
    consumerGroup?: StringFilter<"KafkaProjectionProgress"> | string
    topic?: StringFilter<"KafkaProjectionProgress"> | string
    partition?: IntFilter<"KafkaProjectionProgress"> | number
    lastOffset?: BigIntFilter<"KafkaProjectionProgress"> | bigint | number
    lastEventAt?: DateTimeFilter<"KafkaProjectionProgress"> | Date | string
    updatedAt?: DateTimeFilter<"KafkaProjectionProgress"> | Date | string
  }

  export type KafkaProjectionProgressOrderByWithRelationInput = {
    id?: SortOrder
    consumerGroup?: SortOrder
    topic?: SortOrder
    partition?: SortOrder
    lastOffset?: SortOrder
    lastEventAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KafkaProjectionProgressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    consumerGroup_topic_partition?: KafkaProjectionProgressConsumerGroupTopicPartitionCompoundUniqueInput
    AND?: KafkaProjectionProgressWhereInput | KafkaProjectionProgressWhereInput[]
    OR?: KafkaProjectionProgressWhereInput[]
    NOT?: KafkaProjectionProgressWhereInput | KafkaProjectionProgressWhereInput[]
    consumerGroup?: StringFilter<"KafkaProjectionProgress"> | string
    topic?: StringFilter<"KafkaProjectionProgress"> | string
    partition?: IntFilter<"KafkaProjectionProgress"> | number
    lastOffset?: BigIntFilter<"KafkaProjectionProgress"> | bigint | number
    lastEventAt?: DateTimeFilter<"KafkaProjectionProgress"> | Date | string
    updatedAt?: DateTimeFilter<"KafkaProjectionProgress"> | Date | string
  }, "id" | "consumerGroup_topic_partition">

  export type KafkaProjectionProgressOrderByWithAggregationInput = {
    id?: SortOrder
    consumerGroup?: SortOrder
    topic?: SortOrder
    partition?: SortOrder
    lastOffset?: SortOrder
    lastEventAt?: SortOrder
    updatedAt?: SortOrder
    _count?: KafkaProjectionProgressCountOrderByAggregateInput
    _avg?: KafkaProjectionProgressAvgOrderByAggregateInput
    _max?: KafkaProjectionProgressMaxOrderByAggregateInput
    _min?: KafkaProjectionProgressMinOrderByAggregateInput
    _sum?: KafkaProjectionProgressSumOrderByAggregateInput
  }

  export type KafkaProjectionProgressScalarWhereWithAggregatesInput = {
    AND?: KafkaProjectionProgressScalarWhereWithAggregatesInput | KafkaProjectionProgressScalarWhereWithAggregatesInput[]
    OR?: KafkaProjectionProgressScalarWhereWithAggregatesInput[]
    NOT?: KafkaProjectionProgressScalarWhereWithAggregatesInput | KafkaProjectionProgressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KafkaProjectionProgress"> | string
    consumerGroup?: StringWithAggregatesFilter<"KafkaProjectionProgress"> | string
    topic?: StringWithAggregatesFilter<"KafkaProjectionProgress"> | string
    partition?: IntWithAggregatesFilter<"KafkaProjectionProgress"> | number
    lastOffset?: BigIntWithAggregatesFilter<"KafkaProjectionProgress"> | bigint | number
    lastEventAt?: DateTimeWithAggregatesFilter<"KafkaProjectionProgress"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"KafkaProjectionProgress"> | Date | string
  }

  export type DailySalesReportCreateInput = {
    id?: string
    date: Date | string
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    averageOrderValue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailySalesReportUncheckedCreateInput = {
    id?: string
    date: Date | string
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    averageOrderValue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailySalesReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesReportCreateManyInput = {
    id?: string
    date: Date | string
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    averageOrderValue?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailySalesReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonthlySalesReportCreateInput = {
    id?: string
    year: number
    month: number
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    averageOrderValue?: Decimal | DecimalJsLike | number | string
    newCustomers?: number
    newSellers?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MonthlySalesReportUncheckedCreateInput = {
    id?: string
    year: number
    month: number
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    averageOrderValue?: Decimal | DecimalJsLike | number | string
    newCustomers?: number
    newSellers?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MonthlySalesReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    month?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newCustomers?: IntFieldUpdateOperationsInput | number
    newSellers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonthlySalesReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    month?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newCustomers?: IntFieldUpdateOperationsInput | number
    newSellers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonthlySalesReportCreateManyInput = {
    id?: string
    year: number
    month: number
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    averageOrderValue?: Decimal | DecimalJsLike | number | string
    newCustomers?: number
    newSellers?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MonthlySalesReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    month?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newCustomers?: IntFieldUpdateOperationsInput | number
    newSellers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MonthlySalesReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    year?: IntFieldUpdateOperationsInput | number
    month?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    averageOrderValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    newCustomers?: IntFieldUpdateOperationsInput | number
    newSellers?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductSalesReportCreateInput = {
    id?: string
    productId: string
    productName: string
    sellerId: string
    sellerName?: string
    categoryId?: string | null
    categoryName?: string | null
    totalUnitsSold?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalOrders?: number
    averageRating?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductSalesReportUncheckedCreateInput = {
    id?: string
    productId: string
    productName: string
    sellerId: string
    sellerName?: string
    categoryId?: string | null
    categoryName?: string | null
    totalUnitsSold?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalOrders?: number
    averageRating?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductSalesReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    categoryName?: NullableStringFieldUpdateOperationsInput | string | null
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductSalesReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    categoryName?: NullableStringFieldUpdateOperationsInput | string | null
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductSalesReportCreateManyInput = {
    id?: string
    productId: string
    productName: string
    sellerId: string
    sellerName?: string
    categoryId?: string | null
    categoryName?: string | null
    totalUnitsSold?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalOrders?: number
    averageRating?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductSalesReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    categoryName?: NullableStringFieldUpdateOperationsInput | string | null
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductSalesReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    categoryName?: NullableStringFieldUpdateOperationsInput | string | null
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SellerPerformanceReportCreateInput = {
    id?: string
    sellerId: string
    sellerName?: string
    totalProducts?: number
    totalOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    totalCancelled?: number
    averageRating?: number
    totalReviews?: number
    cancellationRate?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SellerPerformanceReportUncheckedCreateInput = {
    id?: string
    sellerId: string
    sellerName?: string
    totalProducts?: number
    totalOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    totalCancelled?: number
    averageRating?: number
    totalReviews?: number
    cancellationRate?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SellerPerformanceReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    totalCancelled?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    cancellationRate?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SellerPerformanceReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    totalCancelled?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    cancellationRate?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SellerPerformanceReportCreateManyInput = {
    id?: string
    sellerId: string
    sellerName?: string
    totalProducts?: number
    totalOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    totalCancelled?: number
    averageRating?: number
    totalReviews?: number
    cancellationRate?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SellerPerformanceReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    totalCancelled?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    cancellationRate?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SellerPerformanceReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    sellerName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    totalCancelled?: IntFieldUpdateOperationsInput | number
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    cancellationRate?: FloatFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentReportCreateInput = {
    id?: string
    date: Date | string
    totalTransactions?: number
    successCount?: number
    failedCount?: number
    expiredCount?: number
    successRate?: number
    totalAmount?: Decimal | DecimalJsLike | number | string
    averageAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentReportUncheckedCreateInput = {
    id?: string
    date: Date | string
    totalTransactions?: number
    successCount?: number
    failedCount?: number
    expiredCount?: number
    successRate?: number
    totalAmount?: Decimal | DecimalJsLike | number | string
    averageAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTransactions?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    expiredCount?: IntFieldUpdateOperationsInput | number
    successRate?: FloatFieldUpdateOperationsInput | number
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTransactions?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    expiredCount?: IntFieldUpdateOperationsInput | number
    successRate?: FloatFieldUpdateOperationsInput | number
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentReportCreateManyInput = {
    id?: string
    date: Date | string
    totalTransactions?: number
    successCount?: number
    failedCount?: number
    expiredCount?: number
    successRate?: number
    totalAmount?: Decimal | DecimalJsLike | number | string
    averageAmount?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTransactions?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    expiredCount?: IntFieldUpdateOperationsInput | number
    successRate?: FloatFieldUpdateOperationsInput | number
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalTransactions?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    failedCount?: IntFieldUpdateOperationsInput | number
    expiredCount?: IntFieldUpdateOperationsInput | number
    successRate?: FloatFieldUpdateOperationsInput | number
    totalAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryPerformanceReportCreateInput = {
    id?: string
    categoryId: string
    categoryName: string
    totalProducts?: number
    totalOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalUnitsSold?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryPerformanceReportUncheckedCreateInput = {
    id?: string
    categoryId: string
    categoryName: string
    totalProducts?: number
    totalOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalUnitsSold?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryPerformanceReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    categoryName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryPerformanceReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    categoryName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryPerformanceReportCreateManyInput = {
    id?: string
    categoryId: string
    categoryName: string
    totalProducts?: number
    totalOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalUnitsSold?: number
    periodType: string
    periodDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryPerformanceReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    categoryName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryPerformanceReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    categoryName?: StringFieldUpdateOperationsInput | string
    totalProducts?: IntFieldUpdateOperationsInput | number
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalUnitsSold?: IntFieldUpdateOperationsInput | number
    periodType?: StringFieldUpdateOperationsInput | string
    periodDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventCreateInput = {
    id?: string
    eventId?: string | null
    eventName: string
    eventData: JsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    isProcessed?: boolean
    createdAt?: Date | string
  }

  export type AnalyticsEventUncheckedCreateInput = {
    id?: string
    eventId?: string | null
    eventName: string
    eventData: JsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    isProcessed?: boolean
    createdAt?: Date | string
  }

  export type AnalyticsEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: NullableStringFieldUpdateOperationsInput | string | null
    eventName?: StringFieldUpdateOperationsInput | string
    eventData?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isProcessed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: NullableStringFieldUpdateOperationsInput | string | null
    eventName?: StringFieldUpdateOperationsInput | string
    eventData?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isProcessed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventCreateManyInput = {
    id?: string
    eventId?: string | null
    eventName: string
    eventData: JsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    isProcessed?: boolean
    createdAt?: Date | string
  }

  export type AnalyticsEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: NullableStringFieldUpdateOperationsInput | string | null
    eventName?: StringFieldUpdateOperationsInput | string
    eventData?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isProcessed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: NullableStringFieldUpdateOperationsInput | string | null
    eventName?: StringFieldUpdateOperationsInput | string
    eventData?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isProcessed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InboxEventCreateInput = {
    id?: string
    eventId: string
    consumer: string
    eventName: string
    payload: JsonNullValueInput | InputJsonValue
    status?: string
    attempts?: number
    lastError?: string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InboxEventUncheckedCreateInput = {
    id?: string
    eventId: string
    consumer: string
    eventName: string
    payload: JsonNullValueInput | InputJsonValue
    status?: string
    attempts?: number
    lastError?: string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InboxEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    consumer?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InboxEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    consumer?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InboxEventCreateManyInput = {
    id?: string
    eventId: string
    consumer: string
    eventName: string
    payload: JsonNullValueInput | InputJsonValue
    status?: string
    attempts?: number
    lastError?: string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InboxEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    consumer?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InboxEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    consumer?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    attempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesProjectionCreateInput = {
    id?: string
    date: Date | string
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    updatedAt?: Date | string
  }

  export type DailySalesProjectionUncheckedCreateInput = {
    id?: string
    date: Date | string
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    updatedAt?: Date | string
  }

  export type DailySalesProjectionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesProjectionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesProjectionCreateManyInput = {
    id?: string
    date: Date | string
    totalOrders?: number
    totalCompletedOrders?: number
    totalCancelledOrders?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    totalItemsSold?: number
    updatedAt?: Date | string
  }

  export type DailySalesProjectionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailySalesProjectionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalOrders?: IntFieldUpdateOperationsInput | number
    totalCompletedOrders?: IntFieldUpdateOperationsInput | number
    totalCancelledOrders?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalItemsSold?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KafkaProjectionProgressCreateInput = {
    id?: string
    consumerGroup: string
    topic: string
    partition: number
    lastOffset: bigint | number
    lastEventAt: Date | string
    updatedAt?: Date | string
  }

  export type KafkaProjectionProgressUncheckedCreateInput = {
    id?: string
    consumerGroup: string
    topic: string
    partition: number
    lastOffset: bigint | number
    lastEventAt: Date | string
    updatedAt?: Date | string
  }

  export type KafkaProjectionProgressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerGroup?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    partition?: IntFieldUpdateOperationsInput | number
    lastOffset?: BigIntFieldUpdateOperationsInput | bigint | number
    lastEventAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KafkaProjectionProgressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerGroup?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    partition?: IntFieldUpdateOperationsInput | number
    lastOffset?: BigIntFieldUpdateOperationsInput | bigint | number
    lastEventAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KafkaProjectionProgressCreateManyInput = {
    id?: string
    consumerGroup: string
    topic: string
    partition: number
    lastOffset: bigint | number
    lastEventAt: Date | string
    updatedAt?: Date | string
  }

  export type KafkaProjectionProgressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerGroup?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    partition?: IntFieldUpdateOperationsInput | number
    lastOffset?: BigIntFieldUpdateOperationsInput | bigint | number
    lastEventAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KafkaProjectionProgressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    consumerGroup?: StringFieldUpdateOperationsInput | string
    topic?: StringFieldUpdateOperationsInput | string
    partition?: IntFieldUpdateOperationsInput | number
    lastOffset?: BigIntFieldUpdateOperationsInput | bigint | number
    lastEventAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type DailySalesReportCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesReportAvgOrderByAggregateInput = {
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
  }

  export type DailySalesReportMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesReportMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesReportSumOrderByAggregateInput = {
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
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

  export type MonthlySalesReportYearMonthCompoundUniqueInput = {
    year: number
    month: number
  }

  export type MonthlySalesReportCountOrderByAggregateInput = {
    id?: SortOrder
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MonthlySalesReportAvgOrderByAggregateInput = {
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
  }

  export type MonthlySalesReportMaxOrderByAggregateInput = {
    id?: SortOrder
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MonthlySalesReportMinOrderByAggregateInput = {
    id?: SortOrder
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MonthlySalesReportSumOrderByAggregateInput = {
    year?: SortOrder
    month?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    averageOrderValue?: SortOrder
    newCustomers?: SortOrder
    newSellers?: SortOrder
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

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProductSalesReportProductIdPeriodTypePeriodDateCompoundUniqueInput = {
    productId: string
    periodType: string
    periodDate: Date | string
  }

  export type ProductSalesReportCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSalesReportAvgOrderByAggregateInput = {
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
  }

  export type ProductSalesReportMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSalesReportMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSalesReportSumOrderByAggregateInput = {
    totalUnitsSold?: SortOrder
    totalRevenue?: SortOrder
    totalOrders?: SortOrder
    averageRating?: SortOrder
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

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type SellerPerformanceReportSellerIdPeriodTypePeriodDateCompoundUniqueInput = {
    sellerId: string
    periodType: string
    periodDate: Date | string
  }

  export type SellerPerformanceReportCountOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SellerPerformanceReportAvgOrderByAggregateInput = {
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
  }

  export type SellerPerformanceReportMaxOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SellerPerformanceReportMinOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    sellerName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SellerPerformanceReportSumOrderByAggregateInput = {
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    totalCancelled?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    cancellationRate?: SortOrder
  }

  export type PaymentReportCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentReportAvgOrderByAggregateInput = {
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
  }

  export type PaymentReportMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentReportMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentReportSumOrderByAggregateInput = {
    totalTransactions?: SortOrder
    successCount?: SortOrder
    failedCount?: SortOrder
    expiredCount?: SortOrder
    successRate?: SortOrder
    totalAmount?: SortOrder
    averageAmount?: SortOrder
  }

  export type CategoryPerformanceReportCategoryIdPeriodTypePeriodDateCompoundUniqueInput = {
    categoryId: string
    periodType: string
    periodDate: Date | string
  }

  export type CategoryPerformanceReportCountOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryPerformanceReportAvgOrderByAggregateInput = {
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
  }

  export type CategoryPerformanceReportMaxOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryPerformanceReportMinOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    categoryName?: SortOrder
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
    periodType?: SortOrder
    periodDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryPerformanceReportSumOrderByAggregateInput = {
    totalProducts?: SortOrder
    totalOrders?: SortOrder
    totalRevenue?: SortOrder
    totalUnitsSold?: SortOrder
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

  export type AnalyticsEventCountOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    eventName?: SortOrder
    eventData?: SortOrder
    processedAt?: SortOrder
    isProcessed?: SortOrder
    createdAt?: SortOrder
  }

  export type AnalyticsEventMaxOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    eventName?: SortOrder
    processedAt?: SortOrder
    isProcessed?: SortOrder
    createdAt?: SortOrder
  }

  export type AnalyticsEventMinOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    eventName?: SortOrder
    processedAt?: SortOrder
    isProcessed?: SortOrder
    createdAt?: SortOrder
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

  export type InboxEventEventIdConsumerCompoundUniqueInput = {
    eventId: string
    consumer: string
  }

  export type InboxEventCountOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    consumer?: SortOrder
    eventName?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InboxEventAvgOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type InboxEventMaxOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    consumer?: SortOrder
    eventName?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InboxEventMinOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    consumer?: SortOrder
    eventName?: SortOrder
    status?: SortOrder
    attempts?: SortOrder
    lastError?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InboxEventSumOrderByAggregateInput = {
    attempts?: SortOrder
  }

  export type DailySalesProjectionCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesProjectionAvgOrderByAggregateInput = {
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
  }

  export type DailySalesProjectionMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesProjectionMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailySalesProjectionSumOrderByAggregateInput = {
    totalOrders?: SortOrder
    totalCompletedOrders?: SortOrder
    totalCancelledOrders?: SortOrder
    totalRevenue?: SortOrder
    totalItemsSold?: SortOrder
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type KafkaProjectionProgressConsumerGroupTopicPartitionCompoundUniqueInput = {
    consumerGroup: string
    topic: string
    partition: number
  }

  export type KafkaProjectionProgressCountOrderByAggregateInput = {
    id?: SortOrder
    consumerGroup?: SortOrder
    topic?: SortOrder
    partition?: SortOrder
    lastOffset?: SortOrder
    lastEventAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KafkaProjectionProgressAvgOrderByAggregateInput = {
    partition?: SortOrder
    lastOffset?: SortOrder
  }

  export type KafkaProjectionProgressMaxOrderByAggregateInput = {
    id?: SortOrder
    consumerGroup?: SortOrder
    topic?: SortOrder
    partition?: SortOrder
    lastOffset?: SortOrder
    lastEventAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KafkaProjectionProgressMinOrderByAggregateInput = {
    id?: SortOrder
    consumerGroup?: SortOrder
    topic?: SortOrder
    partition?: SortOrder
    lastOffset?: SortOrder
    lastEventAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type KafkaProjectionProgressSumOrderByAggregateInput = {
    partition?: SortOrder
    lastOffset?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
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

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use DailySalesReportDefaultArgs instead
     */
    export type DailySalesReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DailySalesReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MonthlySalesReportDefaultArgs instead
     */
    export type MonthlySalesReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MonthlySalesReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductSalesReportDefaultArgs instead
     */
    export type ProductSalesReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductSalesReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SellerPerformanceReportDefaultArgs instead
     */
    export type SellerPerformanceReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SellerPerformanceReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PaymentReportDefaultArgs instead
     */
    export type PaymentReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PaymentReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CategoryPerformanceReportDefaultArgs instead
     */
    export type CategoryPerformanceReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CategoryPerformanceReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AnalyticsEventDefaultArgs instead
     */
    export type AnalyticsEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AnalyticsEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InboxEventDefaultArgs instead
     */
    export type InboxEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InboxEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DailySalesProjectionDefaultArgs instead
     */
    export type DailySalesProjectionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DailySalesProjectionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use KafkaProjectionProgressDefaultArgs instead
     */
    export type KafkaProjectionProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = KafkaProjectionProgressDefaultArgs<ExtArgs>

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
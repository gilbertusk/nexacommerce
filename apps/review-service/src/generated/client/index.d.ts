
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
 * Model Review
 * 
 */
export type Review = $Result.DefaultSelection<Prisma.$ReviewPayload>
/**
 * Model ReviewImage
 * 
 */
export type ReviewImage = $Result.DefaultSelection<Prisma.$ReviewImagePayload>
/**
 * Model ReviewReport
 * 
 */
export type ReviewReport = $Result.DefaultSelection<Prisma.$ReviewReportPayload>
/**
 * Model ProductRatingSummary
 * 
 */
export type ProductRatingSummary = $Result.DefaultSelection<Prisma.$ProductRatingSummaryPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Reviews
 * const reviews = await prisma.review.findMany()
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
   * // Fetch zero or more Reviews
   * const reviews = await prisma.review.findMany()
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
   * `prisma.review`: Exposes CRUD operations for the **Review** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reviews
    * const reviews = await prisma.review.findMany()
    * ```
    */
  get review(): Prisma.ReviewDelegate<ExtArgs>;

  /**
   * `prisma.reviewImage`: Exposes CRUD operations for the **ReviewImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReviewImages
    * const reviewImages = await prisma.reviewImage.findMany()
    * ```
    */
  get reviewImage(): Prisma.ReviewImageDelegate<ExtArgs>;

  /**
   * `prisma.reviewReport`: Exposes CRUD operations for the **ReviewReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReviewReports
    * const reviewReports = await prisma.reviewReport.findMany()
    * ```
    */
  get reviewReport(): Prisma.ReviewReportDelegate<ExtArgs>;

  /**
   * `prisma.productRatingSummary`: Exposes CRUD operations for the **ProductRatingSummary** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductRatingSummaries
    * const productRatingSummaries = await prisma.productRatingSummary.findMany()
    * ```
    */
  get productRatingSummary(): Prisma.ProductRatingSummaryDelegate<ExtArgs>;
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
    Review: 'Review',
    ReviewImage: 'ReviewImage',
    ReviewReport: 'ReviewReport',
    ProductRatingSummary: 'ProductRatingSummary'
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
      modelProps: "review" | "reviewImage" | "reviewReport" | "productRatingSummary"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Review: {
        payload: Prisma.$ReviewPayload<ExtArgs>
        fields: Prisma.ReviewFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          findFirst: {
            args: Prisma.ReviewFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          findMany: {
            args: Prisma.ReviewFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>[]
          }
          create: {
            args: Prisma.ReviewCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          createMany: {
            args: Prisma.ReviewCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>[]
          }
          delete: {
            args: Prisma.ReviewDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          update: {
            args: Prisma.ReviewUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          deleteMany: {
            args: Prisma.ReviewDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReviewUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          aggregate: {
            args: Prisma.ReviewAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReview>
          }
          groupBy: {
            args: Prisma.ReviewGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewCountAggregateOutputType> | number
          }
        }
      }
      ReviewImage: {
        payload: Prisma.$ReviewImagePayload<ExtArgs>
        fields: Prisma.ReviewImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewImageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewImageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>
          }
          findFirst: {
            args: Prisma.ReviewImageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewImageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>
          }
          findMany: {
            args: Prisma.ReviewImageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>[]
          }
          create: {
            args: Prisma.ReviewImageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>
          }
          createMany: {
            args: Prisma.ReviewImageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewImageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>[]
          }
          delete: {
            args: Prisma.ReviewImageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>
          }
          update: {
            args: Prisma.ReviewImageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>
          }
          deleteMany: {
            args: Prisma.ReviewImageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewImageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReviewImageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewImagePayload>
          }
          aggregate: {
            args: Prisma.ReviewImageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReviewImage>
          }
          groupBy: {
            args: Prisma.ReviewImageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewImageCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewImageCountAggregateOutputType> | number
          }
        }
      }
      ReviewReport: {
        payload: Prisma.$ReviewReportPayload<ExtArgs>
        fields: Prisma.ReviewReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>
          }
          findFirst: {
            args: Prisma.ReviewReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>
          }
          findMany: {
            args: Prisma.ReviewReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>[]
          }
          create: {
            args: Prisma.ReviewReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>
          }
          createMany: {
            args: Prisma.ReviewReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>[]
          }
          delete: {
            args: Prisma.ReviewReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>
          }
          update: {
            args: Prisma.ReviewReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>
          }
          deleteMany: {
            args: Prisma.ReviewReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReviewReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewReportPayload>
          }
          aggregate: {
            args: Prisma.ReviewReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReviewReport>
          }
          groupBy: {
            args: Prisma.ReviewReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewReportCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewReportCountAggregateOutputType> | number
          }
        }
      }
      ProductRatingSummary: {
        payload: Prisma.$ProductRatingSummaryPayload<ExtArgs>
        fields: Prisma.ProductRatingSummaryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductRatingSummaryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductRatingSummaryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>
          }
          findFirst: {
            args: Prisma.ProductRatingSummaryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductRatingSummaryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>
          }
          findMany: {
            args: Prisma.ProductRatingSummaryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>[]
          }
          create: {
            args: Prisma.ProductRatingSummaryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>
          }
          createMany: {
            args: Prisma.ProductRatingSummaryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductRatingSummaryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>[]
          }
          delete: {
            args: Prisma.ProductRatingSummaryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>
          }
          update: {
            args: Prisma.ProductRatingSummaryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>
          }
          deleteMany: {
            args: Prisma.ProductRatingSummaryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductRatingSummaryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductRatingSummaryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductRatingSummaryPayload>
          }
          aggregate: {
            args: Prisma.ProductRatingSummaryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductRatingSummary>
          }
          groupBy: {
            args: Prisma.ProductRatingSummaryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductRatingSummaryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductRatingSummaryCountArgs<ExtArgs>
            result: $Utils.Optional<ProductRatingSummaryCountAggregateOutputType> | number
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
   * Count Type ReviewCountOutputType
   */

  export type ReviewCountOutputType = {
    images: number
    reports: number
  }

  export type ReviewCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | ReviewCountOutputTypeCountImagesArgs
    reports?: boolean | ReviewCountOutputTypeCountReportsArgs
  }

  // Custom InputTypes
  /**
   * ReviewCountOutputType without action
   */
  export type ReviewCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewCountOutputType
     */
    select?: ReviewCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReviewCountOutputType without action
   */
  export type ReviewCountOutputTypeCountImagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewImageWhereInput
  }

  /**
   * ReviewCountOutputType without action
   */
  export type ReviewCountOutputTypeCountReportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewReportWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Review
   */

  export type AggregateReview = {
    _count: ReviewCountAggregateOutputType | null
    _avg: ReviewAvgAggregateOutputType | null
    _sum: ReviewSumAggregateOutputType | null
    _min: ReviewMinAggregateOutputType | null
    _max: ReviewMaxAggregateOutputType | null
  }

  export type ReviewAvgAggregateOutputType = {
    rating: number | null
  }

  export type ReviewSumAggregateOutputType = {
    rating: number | null
  }

  export type ReviewMinAggregateOutputType = {
    id: string | null
    productId: string | null
    customerId: string | null
    customerName: string | null
    orderId: string | null
    orderItemId: string | null
    rating: number | null
    title: string | null
    content: string | null
    isVerifiedPurchase: boolean | null
    isVisible: boolean | null
    isEdited: boolean | null
    moderationStatus: string | null
    moderationNote: string | null
    moderatedBy: string | null
    moderatedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReviewMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    customerId: string | null
    customerName: string | null
    orderId: string | null
    orderItemId: string | null
    rating: number | null
    title: string | null
    content: string | null
    isVerifiedPurchase: boolean | null
    isVisible: boolean | null
    isEdited: boolean | null
    moderationStatus: string | null
    moderationNote: string | null
    moderatedBy: string | null
    moderatedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReviewCountAggregateOutputType = {
    id: number
    productId: number
    customerId: number
    customerName: number
    orderId: number
    orderItemId: number
    rating: number
    title: number
    content: number
    isVerifiedPurchase: number
    isVisible: number
    isEdited: number
    moderationStatus: number
    moderationNote: number
    moderatedBy: number
    moderatedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReviewAvgAggregateInputType = {
    rating?: true
  }

  export type ReviewSumAggregateInputType = {
    rating?: true
  }

  export type ReviewMinAggregateInputType = {
    id?: true
    productId?: true
    customerId?: true
    customerName?: true
    orderId?: true
    orderItemId?: true
    rating?: true
    title?: true
    content?: true
    isVerifiedPurchase?: true
    isVisible?: true
    isEdited?: true
    moderationStatus?: true
    moderationNote?: true
    moderatedBy?: true
    moderatedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReviewMaxAggregateInputType = {
    id?: true
    productId?: true
    customerId?: true
    customerName?: true
    orderId?: true
    orderItemId?: true
    rating?: true
    title?: true
    content?: true
    isVerifiedPurchase?: true
    isVisible?: true
    isEdited?: true
    moderationStatus?: true
    moderationNote?: true
    moderatedBy?: true
    moderatedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReviewCountAggregateInputType = {
    id?: true
    productId?: true
    customerId?: true
    customerName?: true
    orderId?: true
    orderItemId?: true
    rating?: true
    title?: true
    content?: true
    isVerifiedPurchase?: true
    isVisible?: true
    isEdited?: true
    moderationStatus?: true
    moderationNote?: true
    moderatedBy?: true
    moderatedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReviewAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Review to aggregate.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Reviews
    **/
    _count?: true | ReviewCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReviewAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReviewSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewMaxAggregateInputType
  }

  export type GetReviewAggregateType<T extends ReviewAggregateArgs> = {
        [P in keyof T & keyof AggregateReview]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReview[P]>
      : GetScalarType<T[P], AggregateReview[P]>
  }




  export type ReviewGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewWhereInput
    orderBy?: ReviewOrderByWithAggregationInput | ReviewOrderByWithAggregationInput[]
    by: ReviewScalarFieldEnum[] | ReviewScalarFieldEnum
    having?: ReviewScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewCountAggregateInputType | true
    _avg?: ReviewAvgAggregateInputType
    _sum?: ReviewSumAggregateInputType
    _min?: ReviewMinAggregateInputType
    _max?: ReviewMaxAggregateInputType
  }

  export type ReviewGroupByOutputType = {
    id: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title: string | null
    content: string
    isVerifiedPurchase: boolean
    isVisible: boolean
    isEdited: boolean
    moderationStatus: string
    moderationNote: string | null
    moderatedBy: string | null
    moderatedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ReviewCountAggregateOutputType | null
    _avg: ReviewAvgAggregateOutputType | null
    _sum: ReviewSumAggregateOutputType | null
    _min: ReviewMinAggregateOutputType | null
    _max: ReviewMaxAggregateOutputType | null
  }

  type GetReviewGroupByPayload<T extends ReviewGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewGroupByOutputType[P]>
        }
      >
    >


  export type ReviewSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    customerId?: boolean
    customerName?: boolean
    orderId?: boolean
    orderItemId?: boolean
    rating?: boolean
    title?: boolean
    content?: boolean
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: boolean
    moderationNote?: boolean
    moderatedBy?: boolean
    moderatedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    images?: boolean | Review$imagesArgs<ExtArgs>
    reports?: boolean | Review$reportsArgs<ExtArgs>
    _count?: boolean | ReviewCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["review"]>

  export type ReviewSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    customerId?: boolean
    customerName?: boolean
    orderId?: boolean
    orderItemId?: boolean
    rating?: boolean
    title?: boolean
    content?: boolean
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: boolean
    moderationNote?: boolean
    moderatedBy?: boolean
    moderatedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["review"]>

  export type ReviewSelectScalar = {
    id?: boolean
    productId?: boolean
    customerId?: boolean
    customerName?: boolean
    orderId?: boolean
    orderItemId?: boolean
    rating?: boolean
    title?: boolean
    content?: boolean
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: boolean
    moderationNote?: boolean
    moderatedBy?: boolean
    moderatedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReviewInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | Review$imagesArgs<ExtArgs>
    reports?: boolean | Review$reportsArgs<ExtArgs>
    _count?: boolean | ReviewCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReviewIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ReviewPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Review"
    objects: {
      images: Prisma.$ReviewImagePayload<ExtArgs>[]
      reports: Prisma.$ReviewReportPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      customerId: string
      customerName: string
      orderId: string
      orderItemId: string
      rating: number
      title: string | null
      content: string
      isVerifiedPurchase: boolean
      isVisible: boolean
      isEdited: boolean
      moderationStatus: string
      moderationNote: string | null
      moderatedBy: string | null
      moderatedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["review"]>
    composites: {}
  }

  type ReviewGetPayload<S extends boolean | null | undefined | ReviewDefaultArgs> = $Result.GetResult<Prisma.$ReviewPayload, S>

  type ReviewCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ReviewFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ReviewCountAggregateInputType | true
    }

  export interface ReviewDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Review'], meta: { name: 'Review' } }
    /**
     * Find zero or one Review that matches the filter.
     * @param {ReviewFindUniqueArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewFindUniqueArgs>(args: SelectSubset<T, ReviewFindUniqueArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Review that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ReviewFindUniqueOrThrowArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Review that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewFindFirstArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewFindFirstArgs>(args?: SelectSubset<T, ReviewFindFirstArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Review that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewFindFirstOrThrowArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Reviews that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reviews
     * const reviews = await prisma.review.findMany()
     * 
     * // Get first 10 Reviews
     * const reviews = await prisma.review.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reviewWithIdOnly = await prisma.review.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReviewFindManyArgs>(args?: SelectSubset<T, ReviewFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Review.
     * @param {ReviewCreateArgs} args - Arguments to create a Review.
     * @example
     * // Create one Review
     * const Review = await prisma.review.create({
     *   data: {
     *     // ... data to create a Review
     *   }
     * })
     * 
     */
    create<T extends ReviewCreateArgs>(args: SelectSubset<T, ReviewCreateArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Reviews.
     * @param {ReviewCreateManyArgs} args - Arguments to create many Reviews.
     * @example
     * // Create many Reviews
     * const review = await prisma.review.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewCreateManyArgs>(args?: SelectSubset<T, ReviewCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reviews and returns the data saved in the database.
     * @param {ReviewCreateManyAndReturnArgs} args - Arguments to create many Reviews.
     * @example
     * // Create many Reviews
     * const review = await prisma.review.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reviews and only return the `id`
     * const reviewWithIdOnly = await prisma.review.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Review.
     * @param {ReviewDeleteArgs} args - Arguments to delete one Review.
     * @example
     * // Delete one Review
     * const Review = await prisma.review.delete({
     *   where: {
     *     // ... filter to delete one Review
     *   }
     * })
     * 
     */
    delete<T extends ReviewDeleteArgs>(args: SelectSubset<T, ReviewDeleteArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Review.
     * @param {ReviewUpdateArgs} args - Arguments to update one Review.
     * @example
     * // Update one Review
     * const review = await prisma.review.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewUpdateArgs>(args: SelectSubset<T, ReviewUpdateArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Reviews.
     * @param {ReviewDeleteManyArgs} args - Arguments to filter Reviews to delete.
     * @example
     * // Delete a few Reviews
     * const { count } = await prisma.review.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewDeleteManyArgs>(args?: SelectSubset<T, ReviewDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reviews
     * const review = await prisma.review.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewUpdateManyArgs>(args: SelectSubset<T, ReviewUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Review.
     * @param {ReviewUpsertArgs} args - Arguments to update or create a Review.
     * @example
     * // Update or create a Review
     * const review = await prisma.review.upsert({
     *   create: {
     *     // ... data to create a Review
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Review we want to update
     *   }
     * })
     */
    upsert<T extends ReviewUpsertArgs>(args: SelectSubset<T, ReviewUpsertArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Reviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewCountArgs} args - Arguments to filter Reviews to count.
     * @example
     * // Count the number of Reviews
     * const count = await prisma.review.count({
     *   where: {
     *     // ... the filter for the Reviews we want to count
     *   }
     * })
    **/
    count<T extends ReviewCountArgs>(
      args?: Subset<T, ReviewCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Review.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ReviewAggregateArgs>(args: Subset<T, ReviewAggregateArgs>): Prisma.PrismaPromise<GetReviewAggregateType<T>>

    /**
     * Group by Review.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewGroupByArgs} args - Group by arguments.
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
      T extends ReviewGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewGroupByArgs['orderBy'] }
        : { orderBy?: ReviewGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ReviewGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Review model
   */
  readonly fields: ReviewFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Review.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    images<T extends Review$imagesArgs<ExtArgs> = {}>(args?: Subset<T, Review$imagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "findMany"> | Null>
    reports<T extends Review$reportsArgs<ExtArgs> = {}>(args?: Subset<T, Review$reportsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Review model
   */ 
  interface ReviewFieldRefs {
    readonly id: FieldRef<"Review", 'String'>
    readonly productId: FieldRef<"Review", 'String'>
    readonly customerId: FieldRef<"Review", 'String'>
    readonly customerName: FieldRef<"Review", 'String'>
    readonly orderId: FieldRef<"Review", 'String'>
    readonly orderItemId: FieldRef<"Review", 'String'>
    readonly rating: FieldRef<"Review", 'Int'>
    readonly title: FieldRef<"Review", 'String'>
    readonly content: FieldRef<"Review", 'String'>
    readonly isVerifiedPurchase: FieldRef<"Review", 'Boolean'>
    readonly isVisible: FieldRef<"Review", 'Boolean'>
    readonly isEdited: FieldRef<"Review", 'Boolean'>
    readonly moderationStatus: FieldRef<"Review", 'String'>
    readonly moderationNote: FieldRef<"Review", 'String'>
    readonly moderatedBy: FieldRef<"Review", 'String'>
    readonly moderatedAt: FieldRef<"Review", 'DateTime'>
    readonly createdAt: FieldRef<"Review", 'DateTime'>
    readonly updatedAt: FieldRef<"Review", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Review findUnique
   */
  export type ReviewFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review findUniqueOrThrow
   */
  export type ReviewFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review findFirst
   */
  export type ReviewFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reviews.
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reviews.
     */
    distinct?: ReviewScalarFieldEnum | ReviewScalarFieldEnum[]
  }

  /**
   * Review findFirstOrThrow
   */
  export type ReviewFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reviews.
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reviews.
     */
    distinct?: ReviewScalarFieldEnum | ReviewScalarFieldEnum[]
  }

  /**
   * Review findMany
   */
  export type ReviewFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Reviews to fetch.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Reviews.
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    distinct?: ReviewScalarFieldEnum | ReviewScalarFieldEnum[]
  }

  /**
   * Review create
   */
  export type ReviewCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * The data needed to create a Review.
     */
    data: XOR<ReviewCreateInput, ReviewUncheckedCreateInput>
  }

  /**
   * Review createMany
   */
  export type ReviewCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Reviews.
     */
    data: ReviewCreateManyInput | ReviewCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Review createManyAndReturn
   */
  export type ReviewCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Reviews.
     */
    data: ReviewCreateManyInput | ReviewCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Review update
   */
  export type ReviewUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * The data needed to update a Review.
     */
    data: XOR<ReviewUpdateInput, ReviewUncheckedUpdateInput>
    /**
     * Choose, which Review to update.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review updateMany
   */
  export type ReviewUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Reviews.
     */
    data: XOR<ReviewUpdateManyMutationInput, ReviewUncheckedUpdateManyInput>
    /**
     * Filter which Reviews to update
     */
    where?: ReviewWhereInput
  }

  /**
   * Review upsert
   */
  export type ReviewUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * The filter to search for the Review to update in case it exists.
     */
    where: ReviewWhereUniqueInput
    /**
     * In case the Review found by the `where` argument doesn't exist, create a new Review with this data.
     */
    create: XOR<ReviewCreateInput, ReviewUncheckedCreateInput>
    /**
     * In case the Review was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewUpdateInput, ReviewUncheckedUpdateInput>
  }

  /**
   * Review delete
   */
  export type ReviewDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter which Review to delete.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review deleteMany
   */
  export type ReviewDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reviews to delete
     */
    where?: ReviewWhereInput
  }

  /**
   * Review.images
   */
  export type Review$imagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    where?: ReviewImageWhereInput
    orderBy?: ReviewImageOrderByWithRelationInput | ReviewImageOrderByWithRelationInput[]
    cursor?: ReviewImageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReviewImageScalarFieldEnum | ReviewImageScalarFieldEnum[]
  }

  /**
   * Review.reports
   */
  export type Review$reportsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    where?: ReviewReportWhereInput
    orderBy?: ReviewReportOrderByWithRelationInput | ReviewReportOrderByWithRelationInput[]
    cursor?: ReviewReportWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReviewReportScalarFieldEnum | ReviewReportScalarFieldEnum[]
  }

  /**
   * Review without action
   */
  export type ReviewDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
  }


  /**
   * Model ReviewImage
   */

  export type AggregateReviewImage = {
    _count: ReviewImageCountAggregateOutputType | null
    _avg: ReviewImageAvgAggregateOutputType | null
    _sum: ReviewImageSumAggregateOutputType | null
    _min: ReviewImageMinAggregateOutputType | null
    _max: ReviewImageMaxAggregateOutputType | null
  }

  export type ReviewImageAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type ReviewImageSumAggregateOutputType = {
    sortOrder: number | null
  }

  export type ReviewImageMinAggregateOutputType = {
    id: string | null
    reviewId: string | null
    url: string | null
    alt: string | null
    sortOrder: number | null
    createdAt: Date | null
  }

  export type ReviewImageMaxAggregateOutputType = {
    id: string | null
    reviewId: string | null
    url: string | null
    alt: string | null
    sortOrder: number | null
    createdAt: Date | null
  }

  export type ReviewImageCountAggregateOutputType = {
    id: number
    reviewId: number
    url: number
    alt: number
    sortOrder: number
    createdAt: number
    _all: number
  }


  export type ReviewImageAvgAggregateInputType = {
    sortOrder?: true
  }

  export type ReviewImageSumAggregateInputType = {
    sortOrder?: true
  }

  export type ReviewImageMinAggregateInputType = {
    id?: true
    reviewId?: true
    url?: true
    alt?: true
    sortOrder?: true
    createdAt?: true
  }

  export type ReviewImageMaxAggregateInputType = {
    id?: true
    reviewId?: true
    url?: true
    alt?: true
    sortOrder?: true
    createdAt?: true
  }

  export type ReviewImageCountAggregateInputType = {
    id?: true
    reviewId?: true
    url?: true
    alt?: true
    sortOrder?: true
    createdAt?: true
    _all?: true
  }

  export type ReviewImageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewImage to aggregate.
     */
    where?: ReviewImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewImages to fetch.
     */
    orderBy?: ReviewImageOrderByWithRelationInput | ReviewImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReviewImages
    **/
    _count?: true | ReviewImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReviewImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReviewImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewImageMaxAggregateInputType
  }

  export type GetReviewImageAggregateType<T extends ReviewImageAggregateArgs> = {
        [P in keyof T & keyof AggregateReviewImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReviewImage[P]>
      : GetScalarType<T[P], AggregateReviewImage[P]>
  }




  export type ReviewImageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewImageWhereInput
    orderBy?: ReviewImageOrderByWithAggregationInput | ReviewImageOrderByWithAggregationInput[]
    by: ReviewImageScalarFieldEnum[] | ReviewImageScalarFieldEnum
    having?: ReviewImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewImageCountAggregateInputType | true
    _avg?: ReviewImageAvgAggregateInputType
    _sum?: ReviewImageSumAggregateInputType
    _min?: ReviewImageMinAggregateInputType
    _max?: ReviewImageMaxAggregateInputType
  }

  export type ReviewImageGroupByOutputType = {
    id: string
    reviewId: string
    url: string
    alt: string | null
    sortOrder: number
    createdAt: Date
    _count: ReviewImageCountAggregateOutputType | null
    _avg: ReviewImageAvgAggregateOutputType | null
    _sum: ReviewImageSumAggregateOutputType | null
    _min: ReviewImageMinAggregateOutputType | null
    _max: ReviewImageMaxAggregateOutputType | null
  }

  type GetReviewImageGroupByPayload<T extends ReviewImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewImageGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewImageGroupByOutputType[P]>
        }
      >
    >


  export type ReviewImageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reviewId?: boolean
    url?: boolean
    alt?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewImage"]>

  export type ReviewImageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reviewId?: boolean
    url?: boolean
    alt?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewImage"]>

  export type ReviewImageSelectScalar = {
    id?: boolean
    reviewId?: boolean
    url?: boolean
    alt?: boolean
    sortOrder?: boolean
    createdAt?: boolean
  }

  export type ReviewImageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }
  export type ReviewImageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }

  export type $ReviewImagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReviewImage"
    objects: {
      review: Prisma.$ReviewPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      reviewId: string
      url: string
      alt: string | null
      sortOrder: number
      createdAt: Date
    }, ExtArgs["result"]["reviewImage"]>
    composites: {}
  }

  type ReviewImageGetPayload<S extends boolean | null | undefined | ReviewImageDefaultArgs> = $Result.GetResult<Prisma.$ReviewImagePayload, S>

  type ReviewImageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ReviewImageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ReviewImageCountAggregateInputType | true
    }

  export interface ReviewImageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReviewImage'], meta: { name: 'ReviewImage' } }
    /**
     * Find zero or one ReviewImage that matches the filter.
     * @param {ReviewImageFindUniqueArgs} args - Arguments to find a ReviewImage
     * @example
     * // Get one ReviewImage
     * const reviewImage = await prisma.reviewImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewImageFindUniqueArgs>(args: SelectSubset<T, ReviewImageFindUniqueArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ReviewImage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ReviewImageFindUniqueOrThrowArgs} args - Arguments to find a ReviewImage
     * @example
     * // Get one ReviewImage
     * const reviewImage = await prisma.reviewImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewImageFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewImageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ReviewImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageFindFirstArgs} args - Arguments to find a ReviewImage
     * @example
     * // Get one ReviewImage
     * const reviewImage = await prisma.reviewImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewImageFindFirstArgs>(args?: SelectSubset<T, ReviewImageFindFirstArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ReviewImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageFindFirstOrThrowArgs} args - Arguments to find a ReviewImage
     * @example
     * // Get one ReviewImage
     * const reviewImage = await prisma.reviewImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewImageFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewImageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ReviewImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReviewImages
     * const reviewImages = await prisma.reviewImage.findMany()
     * 
     * // Get first 10 ReviewImages
     * const reviewImages = await prisma.reviewImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reviewImageWithIdOnly = await prisma.reviewImage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReviewImageFindManyArgs>(args?: SelectSubset<T, ReviewImageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ReviewImage.
     * @param {ReviewImageCreateArgs} args - Arguments to create a ReviewImage.
     * @example
     * // Create one ReviewImage
     * const ReviewImage = await prisma.reviewImage.create({
     *   data: {
     *     // ... data to create a ReviewImage
     *   }
     * })
     * 
     */
    create<T extends ReviewImageCreateArgs>(args: SelectSubset<T, ReviewImageCreateArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ReviewImages.
     * @param {ReviewImageCreateManyArgs} args - Arguments to create many ReviewImages.
     * @example
     * // Create many ReviewImages
     * const reviewImage = await prisma.reviewImage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewImageCreateManyArgs>(args?: SelectSubset<T, ReviewImageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReviewImages and returns the data saved in the database.
     * @param {ReviewImageCreateManyAndReturnArgs} args - Arguments to create many ReviewImages.
     * @example
     * // Create many ReviewImages
     * const reviewImage = await prisma.reviewImage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReviewImages and only return the `id`
     * const reviewImageWithIdOnly = await prisma.reviewImage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewImageCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewImageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ReviewImage.
     * @param {ReviewImageDeleteArgs} args - Arguments to delete one ReviewImage.
     * @example
     * // Delete one ReviewImage
     * const ReviewImage = await prisma.reviewImage.delete({
     *   where: {
     *     // ... filter to delete one ReviewImage
     *   }
     * })
     * 
     */
    delete<T extends ReviewImageDeleteArgs>(args: SelectSubset<T, ReviewImageDeleteArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ReviewImage.
     * @param {ReviewImageUpdateArgs} args - Arguments to update one ReviewImage.
     * @example
     * // Update one ReviewImage
     * const reviewImage = await prisma.reviewImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewImageUpdateArgs>(args: SelectSubset<T, ReviewImageUpdateArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ReviewImages.
     * @param {ReviewImageDeleteManyArgs} args - Arguments to filter ReviewImages to delete.
     * @example
     * // Delete a few ReviewImages
     * const { count } = await prisma.reviewImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewImageDeleteManyArgs>(args?: SelectSubset<T, ReviewImageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReviewImages
     * const reviewImage = await prisma.reviewImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewImageUpdateManyArgs>(args: SelectSubset<T, ReviewImageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ReviewImage.
     * @param {ReviewImageUpsertArgs} args - Arguments to update or create a ReviewImage.
     * @example
     * // Update or create a ReviewImage
     * const reviewImage = await prisma.reviewImage.upsert({
     *   create: {
     *     // ... data to create a ReviewImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReviewImage we want to update
     *   }
     * })
     */
    upsert<T extends ReviewImageUpsertArgs>(args: SelectSubset<T, ReviewImageUpsertArgs<ExtArgs>>): Prisma__ReviewImageClient<$Result.GetResult<Prisma.$ReviewImagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ReviewImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageCountArgs} args - Arguments to filter ReviewImages to count.
     * @example
     * // Count the number of ReviewImages
     * const count = await prisma.reviewImage.count({
     *   where: {
     *     // ... the filter for the ReviewImages we want to count
     *   }
     * })
    **/
    count<T extends ReviewImageCountArgs>(
      args?: Subset<T, ReviewImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReviewImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ReviewImageAggregateArgs>(args: Subset<T, ReviewImageAggregateArgs>): Prisma.PrismaPromise<GetReviewImageAggregateType<T>>

    /**
     * Group by ReviewImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewImageGroupByArgs} args - Group by arguments.
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
      T extends ReviewImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewImageGroupByArgs['orderBy'] }
        : { orderBy?: ReviewImageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ReviewImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReviewImage model
   */
  readonly fields: ReviewImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReviewImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewImageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    review<T extends ReviewDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReviewDefaultArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ReviewImage model
   */ 
  interface ReviewImageFieldRefs {
    readonly id: FieldRef<"ReviewImage", 'String'>
    readonly reviewId: FieldRef<"ReviewImage", 'String'>
    readonly url: FieldRef<"ReviewImage", 'String'>
    readonly alt: FieldRef<"ReviewImage", 'String'>
    readonly sortOrder: FieldRef<"ReviewImage", 'Int'>
    readonly createdAt: FieldRef<"ReviewImage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReviewImage findUnique
   */
  export type ReviewImageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * Filter, which ReviewImage to fetch.
     */
    where: ReviewImageWhereUniqueInput
  }

  /**
   * ReviewImage findUniqueOrThrow
   */
  export type ReviewImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * Filter, which ReviewImage to fetch.
     */
    where: ReviewImageWhereUniqueInput
  }

  /**
   * ReviewImage findFirst
   */
  export type ReviewImageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * Filter, which ReviewImage to fetch.
     */
    where?: ReviewImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewImages to fetch.
     */
    orderBy?: ReviewImageOrderByWithRelationInput | ReviewImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewImages.
     */
    cursor?: ReviewImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewImages.
     */
    distinct?: ReviewImageScalarFieldEnum | ReviewImageScalarFieldEnum[]
  }

  /**
   * ReviewImage findFirstOrThrow
   */
  export type ReviewImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * Filter, which ReviewImage to fetch.
     */
    where?: ReviewImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewImages to fetch.
     */
    orderBy?: ReviewImageOrderByWithRelationInput | ReviewImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewImages.
     */
    cursor?: ReviewImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewImages.
     */
    distinct?: ReviewImageScalarFieldEnum | ReviewImageScalarFieldEnum[]
  }

  /**
   * ReviewImage findMany
   */
  export type ReviewImageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * Filter, which ReviewImages to fetch.
     */
    where?: ReviewImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewImages to fetch.
     */
    orderBy?: ReviewImageOrderByWithRelationInput | ReviewImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReviewImages.
     */
    cursor?: ReviewImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewImages.
     */
    skip?: number
    distinct?: ReviewImageScalarFieldEnum | ReviewImageScalarFieldEnum[]
  }

  /**
   * ReviewImage create
   */
  export type ReviewImageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * The data needed to create a ReviewImage.
     */
    data: XOR<ReviewImageCreateInput, ReviewImageUncheckedCreateInput>
  }

  /**
   * ReviewImage createMany
   */
  export type ReviewImageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReviewImages.
     */
    data: ReviewImageCreateManyInput | ReviewImageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReviewImage createManyAndReturn
   */
  export type ReviewImageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ReviewImages.
     */
    data: ReviewImageCreateManyInput | ReviewImageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewImage update
   */
  export type ReviewImageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * The data needed to update a ReviewImage.
     */
    data: XOR<ReviewImageUpdateInput, ReviewImageUncheckedUpdateInput>
    /**
     * Choose, which ReviewImage to update.
     */
    where: ReviewImageWhereUniqueInput
  }

  /**
   * ReviewImage updateMany
   */
  export type ReviewImageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReviewImages.
     */
    data: XOR<ReviewImageUpdateManyMutationInput, ReviewImageUncheckedUpdateManyInput>
    /**
     * Filter which ReviewImages to update
     */
    where?: ReviewImageWhereInput
  }

  /**
   * ReviewImage upsert
   */
  export type ReviewImageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * The filter to search for the ReviewImage to update in case it exists.
     */
    where: ReviewImageWhereUniqueInput
    /**
     * In case the ReviewImage found by the `where` argument doesn't exist, create a new ReviewImage with this data.
     */
    create: XOR<ReviewImageCreateInput, ReviewImageUncheckedCreateInput>
    /**
     * In case the ReviewImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewImageUpdateInput, ReviewImageUncheckedUpdateInput>
  }

  /**
   * ReviewImage delete
   */
  export type ReviewImageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
    /**
     * Filter which ReviewImage to delete.
     */
    where: ReviewImageWhereUniqueInput
  }

  /**
   * ReviewImage deleteMany
   */
  export type ReviewImageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewImages to delete
     */
    where?: ReviewImageWhereInput
  }

  /**
   * ReviewImage without action
   */
  export type ReviewImageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewImage
     */
    select?: ReviewImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewImageInclude<ExtArgs> | null
  }


  /**
   * Model ReviewReport
   */

  export type AggregateReviewReport = {
    _count: ReviewReportCountAggregateOutputType | null
    _min: ReviewReportMinAggregateOutputType | null
    _max: ReviewReportMaxAggregateOutputType | null
  }

  export type ReviewReportMinAggregateOutputType = {
    id: string | null
    reviewId: string | null
    reportedBy: string | null
    reason: string | null
    description: string | null
    status: string | null
    reviewedBy: string | null
    reviewedAt: Date | null
    createdAt: Date | null
  }

  export type ReviewReportMaxAggregateOutputType = {
    id: string | null
    reviewId: string | null
    reportedBy: string | null
    reason: string | null
    description: string | null
    status: string | null
    reviewedBy: string | null
    reviewedAt: Date | null
    createdAt: Date | null
  }

  export type ReviewReportCountAggregateOutputType = {
    id: number
    reviewId: number
    reportedBy: number
    reason: number
    description: number
    status: number
    reviewedBy: number
    reviewedAt: number
    createdAt: number
    _all: number
  }


  export type ReviewReportMinAggregateInputType = {
    id?: true
    reviewId?: true
    reportedBy?: true
    reason?: true
    description?: true
    status?: true
    reviewedBy?: true
    reviewedAt?: true
    createdAt?: true
  }

  export type ReviewReportMaxAggregateInputType = {
    id?: true
    reviewId?: true
    reportedBy?: true
    reason?: true
    description?: true
    status?: true
    reviewedBy?: true
    reviewedAt?: true
    createdAt?: true
  }

  export type ReviewReportCountAggregateInputType = {
    id?: true
    reviewId?: true
    reportedBy?: true
    reason?: true
    description?: true
    status?: true
    reviewedBy?: true
    reviewedAt?: true
    createdAt?: true
    _all?: true
  }

  export type ReviewReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewReport to aggregate.
     */
    where?: ReviewReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewReports to fetch.
     */
    orderBy?: ReviewReportOrderByWithRelationInput | ReviewReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReviewReports
    **/
    _count?: true | ReviewReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewReportMaxAggregateInputType
  }

  export type GetReviewReportAggregateType<T extends ReviewReportAggregateArgs> = {
        [P in keyof T & keyof AggregateReviewReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReviewReport[P]>
      : GetScalarType<T[P], AggregateReviewReport[P]>
  }




  export type ReviewReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewReportWhereInput
    orderBy?: ReviewReportOrderByWithAggregationInput | ReviewReportOrderByWithAggregationInput[]
    by: ReviewReportScalarFieldEnum[] | ReviewReportScalarFieldEnum
    having?: ReviewReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewReportCountAggregateInputType | true
    _min?: ReviewReportMinAggregateInputType
    _max?: ReviewReportMaxAggregateInputType
  }

  export type ReviewReportGroupByOutputType = {
    id: string
    reviewId: string
    reportedBy: string
    reason: string
    description: string | null
    status: string
    reviewedBy: string | null
    reviewedAt: Date | null
    createdAt: Date
    _count: ReviewReportCountAggregateOutputType | null
    _min: ReviewReportMinAggregateOutputType | null
    _max: ReviewReportMaxAggregateOutputType | null
  }

  type GetReviewReportGroupByPayload<T extends ReviewReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewReportGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewReportGroupByOutputType[P]>
        }
      >
    >


  export type ReviewReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reviewId?: boolean
    reportedBy?: boolean
    reason?: boolean
    description?: boolean
    status?: boolean
    reviewedBy?: boolean
    reviewedAt?: boolean
    createdAt?: boolean
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewReport"]>

  export type ReviewReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reviewId?: boolean
    reportedBy?: boolean
    reason?: boolean
    description?: boolean
    status?: boolean
    reviewedBy?: boolean
    reviewedAt?: boolean
    createdAt?: boolean
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewReport"]>

  export type ReviewReportSelectScalar = {
    id?: boolean
    reviewId?: boolean
    reportedBy?: boolean
    reason?: boolean
    description?: boolean
    status?: boolean
    reviewedBy?: boolean
    reviewedAt?: boolean
    createdAt?: boolean
  }

  export type ReviewReportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }
  export type ReviewReportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    review?: boolean | ReviewDefaultArgs<ExtArgs>
  }

  export type $ReviewReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReviewReport"
    objects: {
      review: Prisma.$ReviewPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      reviewId: string
      reportedBy: string
      reason: string
      description: string | null
      status: string
      reviewedBy: string | null
      reviewedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["reviewReport"]>
    composites: {}
  }

  type ReviewReportGetPayload<S extends boolean | null | undefined | ReviewReportDefaultArgs> = $Result.GetResult<Prisma.$ReviewReportPayload, S>

  type ReviewReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ReviewReportFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ReviewReportCountAggregateInputType | true
    }

  export interface ReviewReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReviewReport'], meta: { name: 'ReviewReport' } }
    /**
     * Find zero or one ReviewReport that matches the filter.
     * @param {ReviewReportFindUniqueArgs} args - Arguments to find a ReviewReport
     * @example
     * // Get one ReviewReport
     * const reviewReport = await prisma.reviewReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewReportFindUniqueArgs>(args: SelectSubset<T, ReviewReportFindUniqueArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ReviewReport that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ReviewReportFindUniqueOrThrowArgs} args - Arguments to find a ReviewReport
     * @example
     * // Get one ReviewReport
     * const reviewReport = await prisma.reviewReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewReportFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ReviewReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportFindFirstArgs} args - Arguments to find a ReviewReport
     * @example
     * // Get one ReviewReport
     * const reviewReport = await prisma.reviewReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewReportFindFirstArgs>(args?: SelectSubset<T, ReviewReportFindFirstArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ReviewReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportFindFirstOrThrowArgs} args - Arguments to find a ReviewReport
     * @example
     * // Get one ReviewReport
     * const reviewReport = await prisma.reviewReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewReportFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ReviewReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReviewReports
     * const reviewReports = await prisma.reviewReport.findMany()
     * 
     * // Get first 10 ReviewReports
     * const reviewReports = await prisma.reviewReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reviewReportWithIdOnly = await prisma.reviewReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReviewReportFindManyArgs>(args?: SelectSubset<T, ReviewReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ReviewReport.
     * @param {ReviewReportCreateArgs} args - Arguments to create a ReviewReport.
     * @example
     * // Create one ReviewReport
     * const ReviewReport = await prisma.reviewReport.create({
     *   data: {
     *     // ... data to create a ReviewReport
     *   }
     * })
     * 
     */
    create<T extends ReviewReportCreateArgs>(args: SelectSubset<T, ReviewReportCreateArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ReviewReports.
     * @param {ReviewReportCreateManyArgs} args - Arguments to create many ReviewReports.
     * @example
     * // Create many ReviewReports
     * const reviewReport = await prisma.reviewReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewReportCreateManyArgs>(args?: SelectSubset<T, ReviewReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReviewReports and returns the data saved in the database.
     * @param {ReviewReportCreateManyAndReturnArgs} args - Arguments to create many ReviewReports.
     * @example
     * // Create many ReviewReports
     * const reviewReport = await prisma.reviewReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReviewReports and only return the `id`
     * const reviewReportWithIdOnly = await prisma.reviewReport.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewReportCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ReviewReport.
     * @param {ReviewReportDeleteArgs} args - Arguments to delete one ReviewReport.
     * @example
     * // Delete one ReviewReport
     * const ReviewReport = await prisma.reviewReport.delete({
     *   where: {
     *     // ... filter to delete one ReviewReport
     *   }
     * })
     * 
     */
    delete<T extends ReviewReportDeleteArgs>(args: SelectSubset<T, ReviewReportDeleteArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ReviewReport.
     * @param {ReviewReportUpdateArgs} args - Arguments to update one ReviewReport.
     * @example
     * // Update one ReviewReport
     * const reviewReport = await prisma.reviewReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewReportUpdateArgs>(args: SelectSubset<T, ReviewReportUpdateArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ReviewReports.
     * @param {ReviewReportDeleteManyArgs} args - Arguments to filter ReviewReports to delete.
     * @example
     * // Delete a few ReviewReports
     * const { count } = await prisma.reviewReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewReportDeleteManyArgs>(args?: SelectSubset<T, ReviewReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReviewReports
     * const reviewReport = await prisma.reviewReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewReportUpdateManyArgs>(args: SelectSubset<T, ReviewReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ReviewReport.
     * @param {ReviewReportUpsertArgs} args - Arguments to update or create a ReviewReport.
     * @example
     * // Update or create a ReviewReport
     * const reviewReport = await prisma.reviewReport.upsert({
     *   create: {
     *     // ... data to create a ReviewReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReviewReport we want to update
     *   }
     * })
     */
    upsert<T extends ReviewReportUpsertArgs>(args: SelectSubset<T, ReviewReportUpsertArgs<ExtArgs>>): Prisma__ReviewReportClient<$Result.GetResult<Prisma.$ReviewReportPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ReviewReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportCountArgs} args - Arguments to filter ReviewReports to count.
     * @example
     * // Count the number of ReviewReports
     * const count = await prisma.reviewReport.count({
     *   where: {
     *     // ... the filter for the ReviewReports we want to count
     *   }
     * })
    **/
    count<T extends ReviewReportCountArgs>(
      args?: Subset<T, ReviewReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReviewReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ReviewReportAggregateArgs>(args: Subset<T, ReviewReportAggregateArgs>): Prisma.PrismaPromise<GetReviewReportAggregateType<T>>

    /**
     * Group by ReviewReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewReportGroupByArgs} args - Group by arguments.
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
      T extends ReviewReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewReportGroupByArgs['orderBy'] }
        : { orderBy?: ReviewReportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ReviewReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReviewReport model
   */
  readonly fields: ReviewReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReviewReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    review<T extends ReviewDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReviewDefaultArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ReviewReport model
   */ 
  interface ReviewReportFieldRefs {
    readonly id: FieldRef<"ReviewReport", 'String'>
    readonly reviewId: FieldRef<"ReviewReport", 'String'>
    readonly reportedBy: FieldRef<"ReviewReport", 'String'>
    readonly reason: FieldRef<"ReviewReport", 'String'>
    readonly description: FieldRef<"ReviewReport", 'String'>
    readonly status: FieldRef<"ReviewReport", 'String'>
    readonly reviewedBy: FieldRef<"ReviewReport", 'String'>
    readonly reviewedAt: FieldRef<"ReviewReport", 'DateTime'>
    readonly createdAt: FieldRef<"ReviewReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReviewReport findUnique
   */
  export type ReviewReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * Filter, which ReviewReport to fetch.
     */
    where: ReviewReportWhereUniqueInput
  }

  /**
   * ReviewReport findUniqueOrThrow
   */
  export type ReviewReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * Filter, which ReviewReport to fetch.
     */
    where: ReviewReportWhereUniqueInput
  }

  /**
   * ReviewReport findFirst
   */
  export type ReviewReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * Filter, which ReviewReport to fetch.
     */
    where?: ReviewReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewReports to fetch.
     */
    orderBy?: ReviewReportOrderByWithRelationInput | ReviewReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewReports.
     */
    cursor?: ReviewReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewReports.
     */
    distinct?: ReviewReportScalarFieldEnum | ReviewReportScalarFieldEnum[]
  }

  /**
   * ReviewReport findFirstOrThrow
   */
  export type ReviewReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * Filter, which ReviewReport to fetch.
     */
    where?: ReviewReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewReports to fetch.
     */
    orderBy?: ReviewReportOrderByWithRelationInput | ReviewReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewReports.
     */
    cursor?: ReviewReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewReports.
     */
    distinct?: ReviewReportScalarFieldEnum | ReviewReportScalarFieldEnum[]
  }

  /**
   * ReviewReport findMany
   */
  export type ReviewReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * Filter, which ReviewReports to fetch.
     */
    where?: ReviewReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewReports to fetch.
     */
    orderBy?: ReviewReportOrderByWithRelationInput | ReviewReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReviewReports.
     */
    cursor?: ReviewReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewReports.
     */
    skip?: number
    distinct?: ReviewReportScalarFieldEnum | ReviewReportScalarFieldEnum[]
  }

  /**
   * ReviewReport create
   */
  export type ReviewReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * The data needed to create a ReviewReport.
     */
    data: XOR<ReviewReportCreateInput, ReviewReportUncheckedCreateInput>
  }

  /**
   * ReviewReport createMany
   */
  export type ReviewReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReviewReports.
     */
    data: ReviewReportCreateManyInput | ReviewReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReviewReport createManyAndReturn
   */
  export type ReviewReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ReviewReports.
     */
    data: ReviewReportCreateManyInput | ReviewReportCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewReport update
   */
  export type ReviewReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * The data needed to update a ReviewReport.
     */
    data: XOR<ReviewReportUpdateInput, ReviewReportUncheckedUpdateInput>
    /**
     * Choose, which ReviewReport to update.
     */
    where: ReviewReportWhereUniqueInput
  }

  /**
   * ReviewReport updateMany
   */
  export type ReviewReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReviewReports.
     */
    data: XOR<ReviewReportUpdateManyMutationInput, ReviewReportUncheckedUpdateManyInput>
    /**
     * Filter which ReviewReports to update
     */
    where?: ReviewReportWhereInput
  }

  /**
   * ReviewReport upsert
   */
  export type ReviewReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * The filter to search for the ReviewReport to update in case it exists.
     */
    where: ReviewReportWhereUniqueInput
    /**
     * In case the ReviewReport found by the `where` argument doesn't exist, create a new ReviewReport with this data.
     */
    create: XOR<ReviewReportCreateInput, ReviewReportUncheckedCreateInput>
    /**
     * In case the ReviewReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewReportUpdateInput, ReviewReportUncheckedUpdateInput>
  }

  /**
   * ReviewReport delete
   */
  export type ReviewReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
    /**
     * Filter which ReviewReport to delete.
     */
    where: ReviewReportWhereUniqueInput
  }

  /**
   * ReviewReport deleteMany
   */
  export type ReviewReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewReports to delete
     */
    where?: ReviewReportWhereInput
  }

  /**
   * ReviewReport without action
   */
  export type ReviewReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewReport
     */
    select?: ReviewReportSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewReportInclude<ExtArgs> | null
  }


  /**
   * Model ProductRatingSummary
   */

  export type AggregateProductRatingSummary = {
    _count: ProductRatingSummaryCountAggregateOutputType | null
    _avg: ProductRatingSummaryAvgAggregateOutputType | null
    _sum: ProductRatingSummarySumAggregateOutputType | null
    _min: ProductRatingSummaryMinAggregateOutputType | null
    _max: ProductRatingSummaryMaxAggregateOutputType | null
  }

  export type ProductRatingSummaryAvgAggregateOutputType = {
    averageRating: number | null
    totalReviews: number | null
    rating5Count: number | null
    rating4Count: number | null
    rating3Count: number | null
    rating2Count: number | null
    rating1Count: number | null
  }

  export type ProductRatingSummarySumAggregateOutputType = {
    averageRating: number | null
    totalReviews: number | null
    rating5Count: number | null
    rating4Count: number | null
    rating3Count: number | null
    rating2Count: number | null
    rating1Count: number | null
  }

  export type ProductRatingSummaryMinAggregateOutputType = {
    id: string | null
    productId: string | null
    averageRating: number | null
    totalReviews: number | null
    rating5Count: number | null
    rating4Count: number | null
    rating3Count: number | null
    rating2Count: number | null
    rating1Count: number | null
    updatedAt: Date | null
  }

  export type ProductRatingSummaryMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    averageRating: number | null
    totalReviews: number | null
    rating5Count: number | null
    rating4Count: number | null
    rating3Count: number | null
    rating2Count: number | null
    rating1Count: number | null
    updatedAt: Date | null
  }

  export type ProductRatingSummaryCountAggregateOutputType = {
    id: number
    productId: number
    averageRating: number
    totalReviews: number
    rating5Count: number
    rating4Count: number
    rating3Count: number
    rating2Count: number
    rating1Count: number
    updatedAt: number
    _all: number
  }


  export type ProductRatingSummaryAvgAggregateInputType = {
    averageRating?: true
    totalReviews?: true
    rating5Count?: true
    rating4Count?: true
    rating3Count?: true
    rating2Count?: true
    rating1Count?: true
  }

  export type ProductRatingSummarySumAggregateInputType = {
    averageRating?: true
    totalReviews?: true
    rating5Count?: true
    rating4Count?: true
    rating3Count?: true
    rating2Count?: true
    rating1Count?: true
  }

  export type ProductRatingSummaryMinAggregateInputType = {
    id?: true
    productId?: true
    averageRating?: true
    totalReviews?: true
    rating5Count?: true
    rating4Count?: true
    rating3Count?: true
    rating2Count?: true
    rating1Count?: true
    updatedAt?: true
  }

  export type ProductRatingSummaryMaxAggregateInputType = {
    id?: true
    productId?: true
    averageRating?: true
    totalReviews?: true
    rating5Count?: true
    rating4Count?: true
    rating3Count?: true
    rating2Count?: true
    rating1Count?: true
    updatedAt?: true
  }

  export type ProductRatingSummaryCountAggregateInputType = {
    id?: true
    productId?: true
    averageRating?: true
    totalReviews?: true
    rating5Count?: true
    rating4Count?: true
    rating3Count?: true
    rating2Count?: true
    rating1Count?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductRatingSummaryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductRatingSummary to aggregate.
     */
    where?: ProductRatingSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductRatingSummaries to fetch.
     */
    orderBy?: ProductRatingSummaryOrderByWithRelationInput | ProductRatingSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductRatingSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductRatingSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductRatingSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductRatingSummaries
    **/
    _count?: true | ProductRatingSummaryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductRatingSummaryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductRatingSummarySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductRatingSummaryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductRatingSummaryMaxAggregateInputType
  }

  export type GetProductRatingSummaryAggregateType<T extends ProductRatingSummaryAggregateArgs> = {
        [P in keyof T & keyof AggregateProductRatingSummary]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductRatingSummary[P]>
      : GetScalarType<T[P], AggregateProductRatingSummary[P]>
  }




  export type ProductRatingSummaryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductRatingSummaryWhereInput
    orderBy?: ProductRatingSummaryOrderByWithAggregationInput | ProductRatingSummaryOrderByWithAggregationInput[]
    by: ProductRatingSummaryScalarFieldEnum[] | ProductRatingSummaryScalarFieldEnum
    having?: ProductRatingSummaryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductRatingSummaryCountAggregateInputType | true
    _avg?: ProductRatingSummaryAvgAggregateInputType
    _sum?: ProductRatingSummarySumAggregateInputType
    _min?: ProductRatingSummaryMinAggregateInputType
    _max?: ProductRatingSummaryMaxAggregateInputType
  }

  export type ProductRatingSummaryGroupByOutputType = {
    id: string
    productId: string
    averageRating: number
    totalReviews: number
    rating5Count: number
    rating4Count: number
    rating3Count: number
    rating2Count: number
    rating1Count: number
    updatedAt: Date
    _count: ProductRatingSummaryCountAggregateOutputType | null
    _avg: ProductRatingSummaryAvgAggregateOutputType | null
    _sum: ProductRatingSummarySumAggregateOutputType | null
    _min: ProductRatingSummaryMinAggregateOutputType | null
    _max: ProductRatingSummaryMaxAggregateOutputType | null
  }

  type GetProductRatingSummaryGroupByPayload<T extends ProductRatingSummaryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductRatingSummaryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductRatingSummaryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductRatingSummaryGroupByOutputType[P]>
            : GetScalarType<T[P], ProductRatingSummaryGroupByOutputType[P]>
        }
      >
    >


  export type ProductRatingSummarySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    averageRating?: boolean
    totalReviews?: boolean
    rating5Count?: boolean
    rating4Count?: boolean
    rating3Count?: boolean
    rating2Count?: boolean
    rating1Count?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productRatingSummary"]>

  export type ProductRatingSummarySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    averageRating?: boolean
    totalReviews?: boolean
    rating5Count?: boolean
    rating4Count?: boolean
    rating3Count?: boolean
    rating2Count?: boolean
    rating1Count?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["productRatingSummary"]>

  export type ProductRatingSummarySelectScalar = {
    id?: boolean
    productId?: boolean
    averageRating?: boolean
    totalReviews?: boolean
    rating5Count?: boolean
    rating4Count?: boolean
    rating3Count?: boolean
    rating2Count?: boolean
    rating1Count?: boolean
    updatedAt?: boolean
  }


  export type $ProductRatingSummaryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductRatingSummary"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      averageRating: number
      totalReviews: number
      rating5Count: number
      rating4Count: number
      rating3Count: number
      rating2Count: number
      rating1Count: number
      updatedAt: Date
    }, ExtArgs["result"]["productRatingSummary"]>
    composites: {}
  }

  type ProductRatingSummaryGetPayload<S extends boolean | null | undefined | ProductRatingSummaryDefaultArgs> = $Result.GetResult<Prisma.$ProductRatingSummaryPayload, S>

  type ProductRatingSummaryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductRatingSummaryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductRatingSummaryCountAggregateInputType | true
    }

  export interface ProductRatingSummaryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductRatingSummary'], meta: { name: 'ProductRatingSummary' } }
    /**
     * Find zero or one ProductRatingSummary that matches the filter.
     * @param {ProductRatingSummaryFindUniqueArgs} args - Arguments to find a ProductRatingSummary
     * @example
     * // Get one ProductRatingSummary
     * const productRatingSummary = await prisma.productRatingSummary.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductRatingSummaryFindUniqueArgs>(args: SelectSubset<T, ProductRatingSummaryFindUniqueArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductRatingSummary that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductRatingSummaryFindUniqueOrThrowArgs} args - Arguments to find a ProductRatingSummary
     * @example
     * // Get one ProductRatingSummary
     * const productRatingSummary = await prisma.productRatingSummary.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductRatingSummaryFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductRatingSummaryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductRatingSummary that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryFindFirstArgs} args - Arguments to find a ProductRatingSummary
     * @example
     * // Get one ProductRatingSummary
     * const productRatingSummary = await prisma.productRatingSummary.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductRatingSummaryFindFirstArgs>(args?: SelectSubset<T, ProductRatingSummaryFindFirstArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductRatingSummary that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryFindFirstOrThrowArgs} args - Arguments to find a ProductRatingSummary
     * @example
     * // Get one ProductRatingSummary
     * const productRatingSummary = await prisma.productRatingSummary.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductRatingSummaryFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductRatingSummaryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductRatingSummaries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductRatingSummaries
     * const productRatingSummaries = await prisma.productRatingSummary.findMany()
     * 
     * // Get first 10 ProductRatingSummaries
     * const productRatingSummaries = await prisma.productRatingSummary.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productRatingSummaryWithIdOnly = await prisma.productRatingSummary.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductRatingSummaryFindManyArgs>(args?: SelectSubset<T, ProductRatingSummaryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductRatingSummary.
     * @param {ProductRatingSummaryCreateArgs} args - Arguments to create a ProductRatingSummary.
     * @example
     * // Create one ProductRatingSummary
     * const ProductRatingSummary = await prisma.productRatingSummary.create({
     *   data: {
     *     // ... data to create a ProductRatingSummary
     *   }
     * })
     * 
     */
    create<T extends ProductRatingSummaryCreateArgs>(args: SelectSubset<T, ProductRatingSummaryCreateArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductRatingSummaries.
     * @param {ProductRatingSummaryCreateManyArgs} args - Arguments to create many ProductRatingSummaries.
     * @example
     * // Create many ProductRatingSummaries
     * const productRatingSummary = await prisma.productRatingSummary.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductRatingSummaryCreateManyArgs>(args?: SelectSubset<T, ProductRatingSummaryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProductRatingSummaries and returns the data saved in the database.
     * @param {ProductRatingSummaryCreateManyAndReturnArgs} args - Arguments to create many ProductRatingSummaries.
     * @example
     * // Create many ProductRatingSummaries
     * const productRatingSummary = await prisma.productRatingSummary.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProductRatingSummaries and only return the `id`
     * const productRatingSummaryWithIdOnly = await prisma.productRatingSummary.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductRatingSummaryCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductRatingSummaryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProductRatingSummary.
     * @param {ProductRatingSummaryDeleteArgs} args - Arguments to delete one ProductRatingSummary.
     * @example
     * // Delete one ProductRatingSummary
     * const ProductRatingSummary = await prisma.productRatingSummary.delete({
     *   where: {
     *     // ... filter to delete one ProductRatingSummary
     *   }
     * })
     * 
     */
    delete<T extends ProductRatingSummaryDeleteArgs>(args: SelectSubset<T, ProductRatingSummaryDeleteArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductRatingSummary.
     * @param {ProductRatingSummaryUpdateArgs} args - Arguments to update one ProductRatingSummary.
     * @example
     * // Update one ProductRatingSummary
     * const productRatingSummary = await prisma.productRatingSummary.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductRatingSummaryUpdateArgs>(args: SelectSubset<T, ProductRatingSummaryUpdateArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductRatingSummaries.
     * @param {ProductRatingSummaryDeleteManyArgs} args - Arguments to filter ProductRatingSummaries to delete.
     * @example
     * // Delete a few ProductRatingSummaries
     * const { count } = await prisma.productRatingSummary.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductRatingSummaryDeleteManyArgs>(args?: SelectSubset<T, ProductRatingSummaryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductRatingSummaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductRatingSummaries
     * const productRatingSummary = await prisma.productRatingSummary.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductRatingSummaryUpdateManyArgs>(args: SelectSubset<T, ProductRatingSummaryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductRatingSummary.
     * @param {ProductRatingSummaryUpsertArgs} args - Arguments to update or create a ProductRatingSummary.
     * @example
     * // Update or create a ProductRatingSummary
     * const productRatingSummary = await prisma.productRatingSummary.upsert({
     *   create: {
     *     // ... data to create a ProductRatingSummary
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductRatingSummary we want to update
     *   }
     * })
     */
    upsert<T extends ProductRatingSummaryUpsertArgs>(args: SelectSubset<T, ProductRatingSummaryUpsertArgs<ExtArgs>>): Prisma__ProductRatingSummaryClient<$Result.GetResult<Prisma.$ProductRatingSummaryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductRatingSummaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryCountArgs} args - Arguments to filter ProductRatingSummaries to count.
     * @example
     * // Count the number of ProductRatingSummaries
     * const count = await prisma.productRatingSummary.count({
     *   where: {
     *     // ... the filter for the ProductRatingSummaries we want to count
     *   }
     * })
    **/
    count<T extends ProductRatingSummaryCountArgs>(
      args?: Subset<T, ProductRatingSummaryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductRatingSummaryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductRatingSummary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductRatingSummaryAggregateArgs>(args: Subset<T, ProductRatingSummaryAggregateArgs>): Prisma.PrismaPromise<GetProductRatingSummaryAggregateType<T>>

    /**
     * Group by ProductRatingSummary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductRatingSummaryGroupByArgs} args - Group by arguments.
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
      T extends ProductRatingSummaryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductRatingSummaryGroupByArgs['orderBy'] }
        : { orderBy?: ProductRatingSummaryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductRatingSummaryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductRatingSummaryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductRatingSummary model
   */
  readonly fields: ProductRatingSummaryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductRatingSummary.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductRatingSummaryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProductRatingSummary model
   */ 
  interface ProductRatingSummaryFieldRefs {
    readonly id: FieldRef<"ProductRatingSummary", 'String'>
    readonly productId: FieldRef<"ProductRatingSummary", 'String'>
    readonly averageRating: FieldRef<"ProductRatingSummary", 'Float'>
    readonly totalReviews: FieldRef<"ProductRatingSummary", 'Int'>
    readonly rating5Count: FieldRef<"ProductRatingSummary", 'Int'>
    readonly rating4Count: FieldRef<"ProductRatingSummary", 'Int'>
    readonly rating3Count: FieldRef<"ProductRatingSummary", 'Int'>
    readonly rating2Count: FieldRef<"ProductRatingSummary", 'Int'>
    readonly rating1Count: FieldRef<"ProductRatingSummary", 'Int'>
    readonly updatedAt: FieldRef<"ProductRatingSummary", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProductRatingSummary findUnique
   */
  export type ProductRatingSummaryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * Filter, which ProductRatingSummary to fetch.
     */
    where: ProductRatingSummaryWhereUniqueInput
  }

  /**
   * ProductRatingSummary findUniqueOrThrow
   */
  export type ProductRatingSummaryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * Filter, which ProductRatingSummary to fetch.
     */
    where: ProductRatingSummaryWhereUniqueInput
  }

  /**
   * ProductRatingSummary findFirst
   */
  export type ProductRatingSummaryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * Filter, which ProductRatingSummary to fetch.
     */
    where?: ProductRatingSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductRatingSummaries to fetch.
     */
    orderBy?: ProductRatingSummaryOrderByWithRelationInput | ProductRatingSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductRatingSummaries.
     */
    cursor?: ProductRatingSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductRatingSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductRatingSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductRatingSummaries.
     */
    distinct?: ProductRatingSummaryScalarFieldEnum | ProductRatingSummaryScalarFieldEnum[]
  }

  /**
   * ProductRatingSummary findFirstOrThrow
   */
  export type ProductRatingSummaryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * Filter, which ProductRatingSummary to fetch.
     */
    where?: ProductRatingSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductRatingSummaries to fetch.
     */
    orderBy?: ProductRatingSummaryOrderByWithRelationInput | ProductRatingSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductRatingSummaries.
     */
    cursor?: ProductRatingSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductRatingSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductRatingSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductRatingSummaries.
     */
    distinct?: ProductRatingSummaryScalarFieldEnum | ProductRatingSummaryScalarFieldEnum[]
  }

  /**
   * ProductRatingSummary findMany
   */
  export type ProductRatingSummaryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * Filter, which ProductRatingSummaries to fetch.
     */
    where?: ProductRatingSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductRatingSummaries to fetch.
     */
    orderBy?: ProductRatingSummaryOrderByWithRelationInput | ProductRatingSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductRatingSummaries.
     */
    cursor?: ProductRatingSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductRatingSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductRatingSummaries.
     */
    skip?: number
    distinct?: ProductRatingSummaryScalarFieldEnum | ProductRatingSummaryScalarFieldEnum[]
  }

  /**
   * ProductRatingSummary create
   */
  export type ProductRatingSummaryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * The data needed to create a ProductRatingSummary.
     */
    data: XOR<ProductRatingSummaryCreateInput, ProductRatingSummaryUncheckedCreateInput>
  }

  /**
   * ProductRatingSummary createMany
   */
  export type ProductRatingSummaryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductRatingSummaries.
     */
    data: ProductRatingSummaryCreateManyInput | ProductRatingSummaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductRatingSummary createManyAndReturn
   */
  export type ProductRatingSummaryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProductRatingSummaries.
     */
    data: ProductRatingSummaryCreateManyInput | ProductRatingSummaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductRatingSummary update
   */
  export type ProductRatingSummaryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * The data needed to update a ProductRatingSummary.
     */
    data: XOR<ProductRatingSummaryUpdateInput, ProductRatingSummaryUncheckedUpdateInput>
    /**
     * Choose, which ProductRatingSummary to update.
     */
    where: ProductRatingSummaryWhereUniqueInput
  }

  /**
   * ProductRatingSummary updateMany
   */
  export type ProductRatingSummaryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductRatingSummaries.
     */
    data: XOR<ProductRatingSummaryUpdateManyMutationInput, ProductRatingSummaryUncheckedUpdateManyInput>
    /**
     * Filter which ProductRatingSummaries to update
     */
    where?: ProductRatingSummaryWhereInput
  }

  /**
   * ProductRatingSummary upsert
   */
  export type ProductRatingSummaryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * The filter to search for the ProductRatingSummary to update in case it exists.
     */
    where: ProductRatingSummaryWhereUniqueInput
    /**
     * In case the ProductRatingSummary found by the `where` argument doesn't exist, create a new ProductRatingSummary with this data.
     */
    create: XOR<ProductRatingSummaryCreateInput, ProductRatingSummaryUncheckedCreateInput>
    /**
     * In case the ProductRatingSummary was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductRatingSummaryUpdateInput, ProductRatingSummaryUncheckedUpdateInput>
  }

  /**
   * ProductRatingSummary delete
   */
  export type ProductRatingSummaryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
    /**
     * Filter which ProductRatingSummary to delete.
     */
    where: ProductRatingSummaryWhereUniqueInput
  }

  /**
   * ProductRatingSummary deleteMany
   */
  export type ProductRatingSummaryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductRatingSummaries to delete
     */
    where?: ProductRatingSummaryWhereInput
  }

  /**
   * ProductRatingSummary without action
   */
  export type ProductRatingSummaryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductRatingSummary
     */
    select?: ProductRatingSummarySelect<ExtArgs> | null
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


  export const ReviewScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    customerId: 'customerId',
    customerName: 'customerName',
    orderId: 'orderId',
    orderItemId: 'orderItemId',
    rating: 'rating',
    title: 'title',
    content: 'content',
    isVerifiedPurchase: 'isVerifiedPurchase',
    isVisible: 'isVisible',
    isEdited: 'isEdited',
    moderationStatus: 'moderationStatus',
    moderationNote: 'moderationNote',
    moderatedBy: 'moderatedBy',
    moderatedAt: 'moderatedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReviewScalarFieldEnum = (typeof ReviewScalarFieldEnum)[keyof typeof ReviewScalarFieldEnum]


  export const ReviewImageScalarFieldEnum: {
    id: 'id',
    reviewId: 'reviewId',
    url: 'url',
    alt: 'alt',
    sortOrder: 'sortOrder',
    createdAt: 'createdAt'
  };

  export type ReviewImageScalarFieldEnum = (typeof ReviewImageScalarFieldEnum)[keyof typeof ReviewImageScalarFieldEnum]


  export const ReviewReportScalarFieldEnum: {
    id: 'id',
    reviewId: 'reviewId',
    reportedBy: 'reportedBy',
    reason: 'reason',
    description: 'description',
    status: 'status',
    reviewedBy: 'reviewedBy',
    reviewedAt: 'reviewedAt',
    createdAt: 'createdAt'
  };

  export type ReviewReportScalarFieldEnum = (typeof ReviewReportScalarFieldEnum)[keyof typeof ReviewReportScalarFieldEnum]


  export const ProductRatingSummaryScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    averageRating: 'averageRating',
    totalReviews: 'totalReviews',
    rating5Count: 'rating5Count',
    rating4Count: 'rating4Count',
    rating3Count: 'rating3Count',
    rating2Count: 'rating2Count',
    rating1Count: 'rating1Count',
    updatedAt: 'updatedAt'
  };

  export type ProductRatingSummaryScalarFieldEnum = (typeof ProductRatingSummaryScalarFieldEnum)[keyof typeof ProductRatingSummaryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type ReviewWhereInput = {
    AND?: ReviewWhereInput | ReviewWhereInput[]
    OR?: ReviewWhereInput[]
    NOT?: ReviewWhereInput | ReviewWhereInput[]
    id?: StringFilter<"Review"> | string
    productId?: StringFilter<"Review"> | string
    customerId?: StringFilter<"Review"> | string
    customerName?: StringFilter<"Review"> | string
    orderId?: StringFilter<"Review"> | string
    orderItemId?: StringFilter<"Review"> | string
    rating?: IntFilter<"Review"> | number
    title?: StringNullableFilter<"Review"> | string | null
    content?: StringFilter<"Review"> | string
    isVerifiedPurchase?: BoolFilter<"Review"> | boolean
    isVisible?: BoolFilter<"Review"> | boolean
    isEdited?: BoolFilter<"Review"> | boolean
    moderationStatus?: StringFilter<"Review"> | string
    moderationNote?: StringNullableFilter<"Review"> | string | null
    moderatedBy?: StringNullableFilter<"Review"> | string | null
    moderatedAt?: DateTimeNullableFilter<"Review"> | Date | string | null
    createdAt?: DateTimeFilter<"Review"> | Date | string
    updatedAt?: DateTimeFilter<"Review"> | Date | string
    images?: ReviewImageListRelationFilter
    reports?: ReviewReportListRelationFilter
  }

  export type ReviewOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    customerId?: SortOrder
    customerName?: SortOrder
    orderId?: SortOrder
    orderItemId?: SortOrder
    rating?: SortOrder
    title?: SortOrderInput | SortOrder
    content?: SortOrder
    isVerifiedPurchase?: SortOrder
    isVisible?: SortOrder
    isEdited?: SortOrder
    moderationStatus?: SortOrder
    moderationNote?: SortOrderInput | SortOrder
    moderatedBy?: SortOrderInput | SortOrder
    moderatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    images?: ReviewImageOrderByRelationAggregateInput
    reports?: ReviewReportOrderByRelationAggregateInput
  }

  export type ReviewWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    customer_order_item?: ReviewCustomer_order_itemCompoundUniqueInput
    AND?: ReviewWhereInput | ReviewWhereInput[]
    OR?: ReviewWhereInput[]
    NOT?: ReviewWhereInput | ReviewWhereInput[]
    productId?: StringFilter<"Review"> | string
    customerId?: StringFilter<"Review"> | string
    customerName?: StringFilter<"Review"> | string
    orderId?: StringFilter<"Review"> | string
    orderItemId?: StringFilter<"Review"> | string
    rating?: IntFilter<"Review"> | number
    title?: StringNullableFilter<"Review"> | string | null
    content?: StringFilter<"Review"> | string
    isVerifiedPurchase?: BoolFilter<"Review"> | boolean
    isVisible?: BoolFilter<"Review"> | boolean
    isEdited?: BoolFilter<"Review"> | boolean
    moderationStatus?: StringFilter<"Review"> | string
    moderationNote?: StringNullableFilter<"Review"> | string | null
    moderatedBy?: StringNullableFilter<"Review"> | string | null
    moderatedAt?: DateTimeNullableFilter<"Review"> | Date | string | null
    createdAt?: DateTimeFilter<"Review"> | Date | string
    updatedAt?: DateTimeFilter<"Review"> | Date | string
    images?: ReviewImageListRelationFilter
    reports?: ReviewReportListRelationFilter
  }, "id" | "customer_order_item">

  export type ReviewOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    customerId?: SortOrder
    customerName?: SortOrder
    orderId?: SortOrder
    orderItemId?: SortOrder
    rating?: SortOrder
    title?: SortOrderInput | SortOrder
    content?: SortOrder
    isVerifiedPurchase?: SortOrder
    isVisible?: SortOrder
    isEdited?: SortOrder
    moderationStatus?: SortOrder
    moderationNote?: SortOrderInput | SortOrder
    moderatedBy?: SortOrderInput | SortOrder
    moderatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReviewCountOrderByAggregateInput
    _avg?: ReviewAvgOrderByAggregateInput
    _max?: ReviewMaxOrderByAggregateInput
    _min?: ReviewMinOrderByAggregateInput
    _sum?: ReviewSumOrderByAggregateInput
  }

  export type ReviewScalarWhereWithAggregatesInput = {
    AND?: ReviewScalarWhereWithAggregatesInput | ReviewScalarWhereWithAggregatesInput[]
    OR?: ReviewScalarWhereWithAggregatesInput[]
    NOT?: ReviewScalarWhereWithAggregatesInput | ReviewScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Review"> | string
    productId?: StringWithAggregatesFilter<"Review"> | string
    customerId?: StringWithAggregatesFilter<"Review"> | string
    customerName?: StringWithAggregatesFilter<"Review"> | string
    orderId?: StringWithAggregatesFilter<"Review"> | string
    orderItemId?: StringWithAggregatesFilter<"Review"> | string
    rating?: IntWithAggregatesFilter<"Review"> | number
    title?: StringNullableWithAggregatesFilter<"Review"> | string | null
    content?: StringWithAggregatesFilter<"Review"> | string
    isVerifiedPurchase?: BoolWithAggregatesFilter<"Review"> | boolean
    isVisible?: BoolWithAggregatesFilter<"Review"> | boolean
    isEdited?: BoolWithAggregatesFilter<"Review"> | boolean
    moderationStatus?: StringWithAggregatesFilter<"Review"> | string
    moderationNote?: StringNullableWithAggregatesFilter<"Review"> | string | null
    moderatedBy?: StringNullableWithAggregatesFilter<"Review"> | string | null
    moderatedAt?: DateTimeNullableWithAggregatesFilter<"Review"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Review"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Review"> | Date | string
  }

  export type ReviewImageWhereInput = {
    AND?: ReviewImageWhereInput | ReviewImageWhereInput[]
    OR?: ReviewImageWhereInput[]
    NOT?: ReviewImageWhereInput | ReviewImageWhereInput[]
    id?: StringFilter<"ReviewImage"> | string
    reviewId?: StringFilter<"ReviewImage"> | string
    url?: StringFilter<"ReviewImage"> | string
    alt?: StringNullableFilter<"ReviewImage"> | string | null
    sortOrder?: IntFilter<"ReviewImage"> | number
    createdAt?: DateTimeFilter<"ReviewImage"> | Date | string
    review?: XOR<ReviewRelationFilter, ReviewWhereInput>
  }

  export type ReviewImageOrderByWithRelationInput = {
    id?: SortOrder
    reviewId?: SortOrder
    url?: SortOrder
    alt?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    review?: ReviewOrderByWithRelationInput
  }

  export type ReviewImageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReviewImageWhereInput | ReviewImageWhereInput[]
    OR?: ReviewImageWhereInput[]
    NOT?: ReviewImageWhereInput | ReviewImageWhereInput[]
    reviewId?: StringFilter<"ReviewImage"> | string
    url?: StringFilter<"ReviewImage"> | string
    alt?: StringNullableFilter<"ReviewImage"> | string | null
    sortOrder?: IntFilter<"ReviewImage"> | number
    createdAt?: DateTimeFilter<"ReviewImage"> | Date | string
    review?: XOR<ReviewRelationFilter, ReviewWhereInput>
  }, "id">

  export type ReviewImageOrderByWithAggregationInput = {
    id?: SortOrder
    reviewId?: SortOrder
    url?: SortOrder
    alt?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    _count?: ReviewImageCountOrderByAggregateInput
    _avg?: ReviewImageAvgOrderByAggregateInput
    _max?: ReviewImageMaxOrderByAggregateInput
    _min?: ReviewImageMinOrderByAggregateInput
    _sum?: ReviewImageSumOrderByAggregateInput
  }

  export type ReviewImageScalarWhereWithAggregatesInput = {
    AND?: ReviewImageScalarWhereWithAggregatesInput | ReviewImageScalarWhereWithAggregatesInput[]
    OR?: ReviewImageScalarWhereWithAggregatesInput[]
    NOT?: ReviewImageScalarWhereWithAggregatesInput | ReviewImageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReviewImage"> | string
    reviewId?: StringWithAggregatesFilter<"ReviewImage"> | string
    url?: StringWithAggregatesFilter<"ReviewImage"> | string
    alt?: StringNullableWithAggregatesFilter<"ReviewImage"> | string | null
    sortOrder?: IntWithAggregatesFilter<"ReviewImage"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ReviewImage"> | Date | string
  }

  export type ReviewReportWhereInput = {
    AND?: ReviewReportWhereInput | ReviewReportWhereInput[]
    OR?: ReviewReportWhereInput[]
    NOT?: ReviewReportWhereInput | ReviewReportWhereInput[]
    id?: StringFilter<"ReviewReport"> | string
    reviewId?: StringFilter<"ReviewReport"> | string
    reportedBy?: StringFilter<"ReviewReport"> | string
    reason?: StringFilter<"ReviewReport"> | string
    description?: StringNullableFilter<"ReviewReport"> | string | null
    status?: StringFilter<"ReviewReport"> | string
    reviewedBy?: StringNullableFilter<"ReviewReport"> | string | null
    reviewedAt?: DateTimeNullableFilter<"ReviewReport"> | Date | string | null
    createdAt?: DateTimeFilter<"ReviewReport"> | Date | string
    review?: XOR<ReviewRelationFilter, ReviewWhereInput>
  }

  export type ReviewReportOrderByWithRelationInput = {
    id?: SortOrder
    reviewId?: SortOrder
    reportedBy?: SortOrder
    reason?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    reviewedBy?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    review?: ReviewOrderByWithRelationInput
  }

  export type ReviewReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReviewReportWhereInput | ReviewReportWhereInput[]
    OR?: ReviewReportWhereInput[]
    NOT?: ReviewReportWhereInput | ReviewReportWhereInput[]
    reviewId?: StringFilter<"ReviewReport"> | string
    reportedBy?: StringFilter<"ReviewReport"> | string
    reason?: StringFilter<"ReviewReport"> | string
    description?: StringNullableFilter<"ReviewReport"> | string | null
    status?: StringFilter<"ReviewReport"> | string
    reviewedBy?: StringNullableFilter<"ReviewReport"> | string | null
    reviewedAt?: DateTimeNullableFilter<"ReviewReport"> | Date | string | null
    createdAt?: DateTimeFilter<"ReviewReport"> | Date | string
    review?: XOR<ReviewRelationFilter, ReviewWhereInput>
  }, "id">

  export type ReviewReportOrderByWithAggregationInput = {
    id?: SortOrder
    reviewId?: SortOrder
    reportedBy?: SortOrder
    reason?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    reviewedBy?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ReviewReportCountOrderByAggregateInput
    _max?: ReviewReportMaxOrderByAggregateInput
    _min?: ReviewReportMinOrderByAggregateInput
  }

  export type ReviewReportScalarWhereWithAggregatesInput = {
    AND?: ReviewReportScalarWhereWithAggregatesInput | ReviewReportScalarWhereWithAggregatesInput[]
    OR?: ReviewReportScalarWhereWithAggregatesInput[]
    NOT?: ReviewReportScalarWhereWithAggregatesInput | ReviewReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReviewReport"> | string
    reviewId?: StringWithAggregatesFilter<"ReviewReport"> | string
    reportedBy?: StringWithAggregatesFilter<"ReviewReport"> | string
    reason?: StringWithAggregatesFilter<"ReviewReport"> | string
    description?: StringNullableWithAggregatesFilter<"ReviewReport"> | string | null
    status?: StringWithAggregatesFilter<"ReviewReport"> | string
    reviewedBy?: StringNullableWithAggregatesFilter<"ReviewReport"> | string | null
    reviewedAt?: DateTimeNullableWithAggregatesFilter<"ReviewReport"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ReviewReport"> | Date | string
  }

  export type ProductRatingSummaryWhereInput = {
    AND?: ProductRatingSummaryWhereInput | ProductRatingSummaryWhereInput[]
    OR?: ProductRatingSummaryWhereInput[]
    NOT?: ProductRatingSummaryWhereInput | ProductRatingSummaryWhereInput[]
    id?: StringFilter<"ProductRatingSummary"> | string
    productId?: StringFilter<"ProductRatingSummary"> | string
    averageRating?: FloatFilter<"ProductRatingSummary"> | number
    totalReviews?: IntFilter<"ProductRatingSummary"> | number
    rating5Count?: IntFilter<"ProductRatingSummary"> | number
    rating4Count?: IntFilter<"ProductRatingSummary"> | number
    rating3Count?: IntFilter<"ProductRatingSummary"> | number
    rating2Count?: IntFilter<"ProductRatingSummary"> | number
    rating1Count?: IntFilter<"ProductRatingSummary"> | number
    updatedAt?: DateTimeFilter<"ProductRatingSummary"> | Date | string
  }

  export type ProductRatingSummaryOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductRatingSummaryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productId?: string
    AND?: ProductRatingSummaryWhereInput | ProductRatingSummaryWhereInput[]
    OR?: ProductRatingSummaryWhereInput[]
    NOT?: ProductRatingSummaryWhereInput | ProductRatingSummaryWhereInput[]
    averageRating?: FloatFilter<"ProductRatingSummary"> | number
    totalReviews?: IntFilter<"ProductRatingSummary"> | number
    rating5Count?: IntFilter<"ProductRatingSummary"> | number
    rating4Count?: IntFilter<"ProductRatingSummary"> | number
    rating3Count?: IntFilter<"ProductRatingSummary"> | number
    rating2Count?: IntFilter<"ProductRatingSummary"> | number
    rating1Count?: IntFilter<"ProductRatingSummary"> | number
    updatedAt?: DateTimeFilter<"ProductRatingSummary"> | Date | string
  }, "id" | "productId">

  export type ProductRatingSummaryOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductRatingSummaryCountOrderByAggregateInput
    _avg?: ProductRatingSummaryAvgOrderByAggregateInput
    _max?: ProductRatingSummaryMaxOrderByAggregateInput
    _min?: ProductRatingSummaryMinOrderByAggregateInput
    _sum?: ProductRatingSummarySumOrderByAggregateInput
  }

  export type ProductRatingSummaryScalarWhereWithAggregatesInput = {
    AND?: ProductRatingSummaryScalarWhereWithAggregatesInput | ProductRatingSummaryScalarWhereWithAggregatesInput[]
    OR?: ProductRatingSummaryScalarWhereWithAggregatesInput[]
    NOT?: ProductRatingSummaryScalarWhereWithAggregatesInput | ProductRatingSummaryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProductRatingSummary"> | string
    productId?: StringWithAggregatesFilter<"ProductRatingSummary"> | string
    averageRating?: FloatWithAggregatesFilter<"ProductRatingSummary"> | number
    totalReviews?: IntWithAggregatesFilter<"ProductRatingSummary"> | number
    rating5Count?: IntWithAggregatesFilter<"ProductRatingSummary"> | number
    rating4Count?: IntWithAggregatesFilter<"ProductRatingSummary"> | number
    rating3Count?: IntWithAggregatesFilter<"ProductRatingSummary"> | number
    rating2Count?: IntWithAggregatesFilter<"ProductRatingSummary"> | number
    rating1Count?: IntWithAggregatesFilter<"ProductRatingSummary"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"ProductRatingSummary"> | Date | string
  }

  export type ReviewCreateInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: ReviewImageCreateNestedManyWithoutReviewInput
    reports?: ReviewReportCreateNestedManyWithoutReviewInput
  }

  export type ReviewUncheckedCreateInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: ReviewImageUncheckedCreateNestedManyWithoutReviewInput
    reports?: ReviewReportUncheckedCreateNestedManyWithoutReviewInput
  }

  export type ReviewUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: ReviewImageUpdateManyWithoutReviewNestedInput
    reports?: ReviewReportUpdateManyWithoutReviewNestedInput
  }

  export type ReviewUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: ReviewImageUncheckedUpdateManyWithoutReviewNestedInput
    reports?: ReviewReportUncheckedUpdateManyWithoutReviewNestedInput
  }

  export type ReviewCreateManyInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReviewUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewImageCreateInput = {
    id?: string
    url: string
    alt?: string | null
    sortOrder?: number
    createdAt?: Date | string
    review: ReviewCreateNestedOneWithoutImagesInput
  }

  export type ReviewImageUncheckedCreateInput = {
    id?: string
    reviewId: string
    url: string
    alt?: string | null
    sortOrder?: number
    createdAt?: Date | string
  }

  export type ReviewImageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    review?: ReviewUpdateOneRequiredWithoutImagesNestedInput
  }

  export type ReviewImageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewImageCreateManyInput = {
    id?: string
    reviewId: string
    url: string
    alt?: string | null
    sortOrder?: number
    createdAt?: Date | string
  }

  export type ReviewImageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewImageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewReportCreateInput = {
    id?: string
    reportedBy: string
    reason: string
    description?: string | null
    status?: string
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    createdAt?: Date | string
    review: ReviewCreateNestedOneWithoutReportsInput
  }

  export type ReviewReportUncheckedCreateInput = {
    id?: string
    reviewId: string
    reportedBy: string
    reason: string
    description?: string | null
    status?: string
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ReviewReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    review?: ReviewUpdateOneRequiredWithoutReportsNestedInput
  }

  export type ReviewReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewId?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewReportCreateManyInput = {
    id?: string
    reviewId: string
    reportedBy: string
    reason: string
    description?: string | null
    status?: string
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ReviewReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    reviewId?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductRatingSummaryCreateInput = {
    id?: string
    productId: string
    averageRating?: number
    totalReviews?: number
    rating5Count?: number
    rating4Count?: number
    rating3Count?: number
    rating2Count?: number
    rating1Count?: number
    updatedAt?: Date | string
  }

  export type ProductRatingSummaryUncheckedCreateInput = {
    id?: string
    productId: string
    averageRating?: number
    totalReviews?: number
    rating5Count?: number
    rating4Count?: number
    rating3Count?: number
    rating2Count?: number
    rating1Count?: number
    updatedAt?: Date | string
  }

  export type ProductRatingSummaryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    rating5Count?: IntFieldUpdateOperationsInput | number
    rating4Count?: IntFieldUpdateOperationsInput | number
    rating3Count?: IntFieldUpdateOperationsInput | number
    rating2Count?: IntFieldUpdateOperationsInput | number
    rating1Count?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductRatingSummaryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    rating5Count?: IntFieldUpdateOperationsInput | number
    rating4Count?: IntFieldUpdateOperationsInput | number
    rating3Count?: IntFieldUpdateOperationsInput | number
    rating2Count?: IntFieldUpdateOperationsInput | number
    rating1Count?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductRatingSummaryCreateManyInput = {
    id?: string
    productId: string
    averageRating?: number
    totalReviews?: number
    rating5Count?: number
    rating4Count?: number
    rating3Count?: number
    rating2Count?: number
    rating1Count?: number
    updatedAt?: Date | string
  }

  export type ProductRatingSummaryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    rating5Count?: IntFieldUpdateOperationsInput | number
    rating4Count?: IntFieldUpdateOperationsInput | number
    rating3Count?: IntFieldUpdateOperationsInput | number
    rating2Count?: IntFieldUpdateOperationsInput | number
    rating1Count?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductRatingSummaryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    averageRating?: FloatFieldUpdateOperationsInput | number
    totalReviews?: IntFieldUpdateOperationsInput | number
    rating5Count?: IntFieldUpdateOperationsInput | number
    rating4Count?: IntFieldUpdateOperationsInput | number
    rating3Count?: IntFieldUpdateOperationsInput | number
    rating2Count?: IntFieldUpdateOperationsInput | number
    rating1Count?: IntFieldUpdateOperationsInput | number
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type ReviewImageListRelationFilter = {
    every?: ReviewImageWhereInput
    some?: ReviewImageWhereInput
    none?: ReviewImageWhereInput
  }

  export type ReviewReportListRelationFilter = {
    every?: ReviewReportWhereInput
    some?: ReviewReportWhereInput
    none?: ReviewReportWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ReviewImageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReviewReportOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReviewCustomer_order_itemCompoundUniqueInput = {
    customerId: string
    orderItemId: string
  }

  export type ReviewCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    customerId?: SortOrder
    customerName?: SortOrder
    orderId?: SortOrder
    orderItemId?: SortOrder
    rating?: SortOrder
    title?: SortOrder
    content?: SortOrder
    isVerifiedPurchase?: SortOrder
    isVisible?: SortOrder
    isEdited?: SortOrder
    moderationStatus?: SortOrder
    moderationNote?: SortOrder
    moderatedBy?: SortOrder
    moderatedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReviewAvgOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type ReviewMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    customerId?: SortOrder
    customerName?: SortOrder
    orderId?: SortOrder
    orderItemId?: SortOrder
    rating?: SortOrder
    title?: SortOrder
    content?: SortOrder
    isVerifiedPurchase?: SortOrder
    isVisible?: SortOrder
    isEdited?: SortOrder
    moderationStatus?: SortOrder
    moderationNote?: SortOrder
    moderatedBy?: SortOrder
    moderatedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReviewMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    customerId?: SortOrder
    customerName?: SortOrder
    orderId?: SortOrder
    orderItemId?: SortOrder
    rating?: SortOrder
    title?: SortOrder
    content?: SortOrder
    isVerifiedPurchase?: SortOrder
    isVisible?: SortOrder
    isEdited?: SortOrder
    moderationStatus?: SortOrder
    moderationNote?: SortOrder
    moderatedBy?: SortOrder
    moderatedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReviewSumOrderByAggregateInput = {
    rating?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type ReviewRelationFilter = {
    is?: ReviewWhereInput
    isNot?: ReviewWhereInput
  }

  export type ReviewImageCountOrderByAggregateInput = {
    id?: SortOrder
    reviewId?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewImageAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type ReviewImageMaxOrderByAggregateInput = {
    id?: SortOrder
    reviewId?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewImageMinOrderByAggregateInput = {
    id?: SortOrder
    reviewId?: SortOrder
    url?: SortOrder
    alt?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewImageSumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type ReviewReportCountOrderByAggregateInput = {
    id?: SortOrder
    reviewId?: SortOrder
    reportedBy?: SortOrder
    reason?: SortOrder
    description?: SortOrder
    status?: SortOrder
    reviewedBy?: SortOrder
    reviewedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewReportMaxOrderByAggregateInput = {
    id?: SortOrder
    reviewId?: SortOrder
    reportedBy?: SortOrder
    reason?: SortOrder
    description?: SortOrder
    status?: SortOrder
    reviewedBy?: SortOrder
    reviewedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewReportMinOrderByAggregateInput = {
    id?: SortOrder
    reviewId?: SortOrder
    reportedBy?: SortOrder
    reason?: SortOrder
    description?: SortOrder
    status?: SortOrder
    reviewedBy?: SortOrder
    reviewedAt?: SortOrder
    createdAt?: SortOrder
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

  export type ProductRatingSummaryCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductRatingSummaryAvgOrderByAggregateInput = {
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
  }

  export type ProductRatingSummaryMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductRatingSummaryMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductRatingSummarySumOrderByAggregateInput = {
    averageRating?: SortOrder
    totalReviews?: SortOrder
    rating5Count?: SortOrder
    rating4Count?: SortOrder
    rating3Count?: SortOrder
    rating2Count?: SortOrder
    rating1Count?: SortOrder
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

  export type ReviewImageCreateNestedManyWithoutReviewInput = {
    create?: XOR<ReviewImageCreateWithoutReviewInput, ReviewImageUncheckedCreateWithoutReviewInput> | ReviewImageCreateWithoutReviewInput[] | ReviewImageUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewImageCreateOrConnectWithoutReviewInput | ReviewImageCreateOrConnectWithoutReviewInput[]
    createMany?: ReviewImageCreateManyReviewInputEnvelope
    connect?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
  }

  export type ReviewReportCreateNestedManyWithoutReviewInput = {
    create?: XOR<ReviewReportCreateWithoutReviewInput, ReviewReportUncheckedCreateWithoutReviewInput> | ReviewReportCreateWithoutReviewInput[] | ReviewReportUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewReportCreateOrConnectWithoutReviewInput | ReviewReportCreateOrConnectWithoutReviewInput[]
    createMany?: ReviewReportCreateManyReviewInputEnvelope
    connect?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
  }

  export type ReviewImageUncheckedCreateNestedManyWithoutReviewInput = {
    create?: XOR<ReviewImageCreateWithoutReviewInput, ReviewImageUncheckedCreateWithoutReviewInput> | ReviewImageCreateWithoutReviewInput[] | ReviewImageUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewImageCreateOrConnectWithoutReviewInput | ReviewImageCreateOrConnectWithoutReviewInput[]
    createMany?: ReviewImageCreateManyReviewInputEnvelope
    connect?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
  }

  export type ReviewReportUncheckedCreateNestedManyWithoutReviewInput = {
    create?: XOR<ReviewReportCreateWithoutReviewInput, ReviewReportUncheckedCreateWithoutReviewInput> | ReviewReportCreateWithoutReviewInput[] | ReviewReportUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewReportCreateOrConnectWithoutReviewInput | ReviewReportCreateOrConnectWithoutReviewInput[]
    createMany?: ReviewReportCreateManyReviewInputEnvelope
    connect?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ReviewImageUpdateManyWithoutReviewNestedInput = {
    create?: XOR<ReviewImageCreateWithoutReviewInput, ReviewImageUncheckedCreateWithoutReviewInput> | ReviewImageCreateWithoutReviewInput[] | ReviewImageUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewImageCreateOrConnectWithoutReviewInput | ReviewImageCreateOrConnectWithoutReviewInput[]
    upsert?: ReviewImageUpsertWithWhereUniqueWithoutReviewInput | ReviewImageUpsertWithWhereUniqueWithoutReviewInput[]
    createMany?: ReviewImageCreateManyReviewInputEnvelope
    set?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    disconnect?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    delete?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    connect?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    update?: ReviewImageUpdateWithWhereUniqueWithoutReviewInput | ReviewImageUpdateWithWhereUniqueWithoutReviewInput[]
    updateMany?: ReviewImageUpdateManyWithWhereWithoutReviewInput | ReviewImageUpdateManyWithWhereWithoutReviewInput[]
    deleteMany?: ReviewImageScalarWhereInput | ReviewImageScalarWhereInput[]
  }

  export type ReviewReportUpdateManyWithoutReviewNestedInput = {
    create?: XOR<ReviewReportCreateWithoutReviewInput, ReviewReportUncheckedCreateWithoutReviewInput> | ReviewReportCreateWithoutReviewInput[] | ReviewReportUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewReportCreateOrConnectWithoutReviewInput | ReviewReportCreateOrConnectWithoutReviewInput[]
    upsert?: ReviewReportUpsertWithWhereUniqueWithoutReviewInput | ReviewReportUpsertWithWhereUniqueWithoutReviewInput[]
    createMany?: ReviewReportCreateManyReviewInputEnvelope
    set?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    disconnect?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    delete?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    connect?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    update?: ReviewReportUpdateWithWhereUniqueWithoutReviewInput | ReviewReportUpdateWithWhereUniqueWithoutReviewInput[]
    updateMany?: ReviewReportUpdateManyWithWhereWithoutReviewInput | ReviewReportUpdateManyWithWhereWithoutReviewInput[]
    deleteMany?: ReviewReportScalarWhereInput | ReviewReportScalarWhereInput[]
  }

  export type ReviewImageUncheckedUpdateManyWithoutReviewNestedInput = {
    create?: XOR<ReviewImageCreateWithoutReviewInput, ReviewImageUncheckedCreateWithoutReviewInput> | ReviewImageCreateWithoutReviewInput[] | ReviewImageUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewImageCreateOrConnectWithoutReviewInput | ReviewImageCreateOrConnectWithoutReviewInput[]
    upsert?: ReviewImageUpsertWithWhereUniqueWithoutReviewInput | ReviewImageUpsertWithWhereUniqueWithoutReviewInput[]
    createMany?: ReviewImageCreateManyReviewInputEnvelope
    set?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    disconnect?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    delete?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    connect?: ReviewImageWhereUniqueInput | ReviewImageWhereUniqueInput[]
    update?: ReviewImageUpdateWithWhereUniqueWithoutReviewInput | ReviewImageUpdateWithWhereUniqueWithoutReviewInput[]
    updateMany?: ReviewImageUpdateManyWithWhereWithoutReviewInput | ReviewImageUpdateManyWithWhereWithoutReviewInput[]
    deleteMany?: ReviewImageScalarWhereInput | ReviewImageScalarWhereInput[]
  }

  export type ReviewReportUncheckedUpdateManyWithoutReviewNestedInput = {
    create?: XOR<ReviewReportCreateWithoutReviewInput, ReviewReportUncheckedCreateWithoutReviewInput> | ReviewReportCreateWithoutReviewInput[] | ReviewReportUncheckedCreateWithoutReviewInput[]
    connectOrCreate?: ReviewReportCreateOrConnectWithoutReviewInput | ReviewReportCreateOrConnectWithoutReviewInput[]
    upsert?: ReviewReportUpsertWithWhereUniqueWithoutReviewInput | ReviewReportUpsertWithWhereUniqueWithoutReviewInput[]
    createMany?: ReviewReportCreateManyReviewInputEnvelope
    set?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    disconnect?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    delete?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    connect?: ReviewReportWhereUniqueInput | ReviewReportWhereUniqueInput[]
    update?: ReviewReportUpdateWithWhereUniqueWithoutReviewInput | ReviewReportUpdateWithWhereUniqueWithoutReviewInput[]
    updateMany?: ReviewReportUpdateManyWithWhereWithoutReviewInput | ReviewReportUpdateManyWithWhereWithoutReviewInput[]
    deleteMany?: ReviewReportScalarWhereInput | ReviewReportScalarWhereInput[]
  }

  export type ReviewCreateNestedOneWithoutImagesInput = {
    create?: XOR<ReviewCreateWithoutImagesInput, ReviewUncheckedCreateWithoutImagesInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutImagesInput
    connect?: ReviewWhereUniqueInput
  }

  export type ReviewUpdateOneRequiredWithoutImagesNestedInput = {
    create?: XOR<ReviewCreateWithoutImagesInput, ReviewUncheckedCreateWithoutImagesInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutImagesInput
    upsert?: ReviewUpsertWithoutImagesInput
    connect?: ReviewWhereUniqueInput
    update?: XOR<XOR<ReviewUpdateToOneWithWhereWithoutImagesInput, ReviewUpdateWithoutImagesInput>, ReviewUncheckedUpdateWithoutImagesInput>
  }

  export type ReviewCreateNestedOneWithoutReportsInput = {
    create?: XOR<ReviewCreateWithoutReportsInput, ReviewUncheckedCreateWithoutReportsInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutReportsInput
    connect?: ReviewWhereUniqueInput
  }

  export type ReviewUpdateOneRequiredWithoutReportsNestedInput = {
    create?: XOR<ReviewCreateWithoutReportsInput, ReviewUncheckedCreateWithoutReportsInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutReportsInput
    upsert?: ReviewUpsertWithoutReportsInput
    connect?: ReviewWhereUniqueInput
    update?: XOR<XOR<ReviewUpdateToOneWithWhereWithoutReportsInput, ReviewUpdateWithoutReportsInput>, ReviewUncheckedUpdateWithoutReportsInput>
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type ReviewImageCreateWithoutReviewInput = {
    id?: string
    url: string
    alt?: string | null
    sortOrder?: number
    createdAt?: Date | string
  }

  export type ReviewImageUncheckedCreateWithoutReviewInput = {
    id?: string
    url: string
    alt?: string | null
    sortOrder?: number
    createdAt?: Date | string
  }

  export type ReviewImageCreateOrConnectWithoutReviewInput = {
    where: ReviewImageWhereUniqueInput
    create: XOR<ReviewImageCreateWithoutReviewInput, ReviewImageUncheckedCreateWithoutReviewInput>
  }

  export type ReviewImageCreateManyReviewInputEnvelope = {
    data: ReviewImageCreateManyReviewInput | ReviewImageCreateManyReviewInput[]
    skipDuplicates?: boolean
  }

  export type ReviewReportCreateWithoutReviewInput = {
    id?: string
    reportedBy: string
    reason: string
    description?: string | null
    status?: string
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ReviewReportUncheckedCreateWithoutReviewInput = {
    id?: string
    reportedBy: string
    reason: string
    description?: string | null
    status?: string
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ReviewReportCreateOrConnectWithoutReviewInput = {
    where: ReviewReportWhereUniqueInput
    create: XOR<ReviewReportCreateWithoutReviewInput, ReviewReportUncheckedCreateWithoutReviewInput>
  }

  export type ReviewReportCreateManyReviewInputEnvelope = {
    data: ReviewReportCreateManyReviewInput | ReviewReportCreateManyReviewInput[]
    skipDuplicates?: boolean
  }

  export type ReviewImageUpsertWithWhereUniqueWithoutReviewInput = {
    where: ReviewImageWhereUniqueInput
    update: XOR<ReviewImageUpdateWithoutReviewInput, ReviewImageUncheckedUpdateWithoutReviewInput>
    create: XOR<ReviewImageCreateWithoutReviewInput, ReviewImageUncheckedCreateWithoutReviewInput>
  }

  export type ReviewImageUpdateWithWhereUniqueWithoutReviewInput = {
    where: ReviewImageWhereUniqueInput
    data: XOR<ReviewImageUpdateWithoutReviewInput, ReviewImageUncheckedUpdateWithoutReviewInput>
  }

  export type ReviewImageUpdateManyWithWhereWithoutReviewInput = {
    where: ReviewImageScalarWhereInput
    data: XOR<ReviewImageUpdateManyMutationInput, ReviewImageUncheckedUpdateManyWithoutReviewInput>
  }

  export type ReviewImageScalarWhereInput = {
    AND?: ReviewImageScalarWhereInput | ReviewImageScalarWhereInput[]
    OR?: ReviewImageScalarWhereInput[]
    NOT?: ReviewImageScalarWhereInput | ReviewImageScalarWhereInput[]
    id?: StringFilter<"ReviewImage"> | string
    reviewId?: StringFilter<"ReviewImage"> | string
    url?: StringFilter<"ReviewImage"> | string
    alt?: StringNullableFilter<"ReviewImage"> | string | null
    sortOrder?: IntFilter<"ReviewImage"> | number
    createdAt?: DateTimeFilter<"ReviewImage"> | Date | string
  }

  export type ReviewReportUpsertWithWhereUniqueWithoutReviewInput = {
    where: ReviewReportWhereUniqueInput
    update: XOR<ReviewReportUpdateWithoutReviewInput, ReviewReportUncheckedUpdateWithoutReviewInput>
    create: XOR<ReviewReportCreateWithoutReviewInput, ReviewReportUncheckedCreateWithoutReviewInput>
  }

  export type ReviewReportUpdateWithWhereUniqueWithoutReviewInput = {
    where: ReviewReportWhereUniqueInput
    data: XOR<ReviewReportUpdateWithoutReviewInput, ReviewReportUncheckedUpdateWithoutReviewInput>
  }

  export type ReviewReportUpdateManyWithWhereWithoutReviewInput = {
    where: ReviewReportScalarWhereInput
    data: XOR<ReviewReportUpdateManyMutationInput, ReviewReportUncheckedUpdateManyWithoutReviewInput>
  }

  export type ReviewReportScalarWhereInput = {
    AND?: ReviewReportScalarWhereInput | ReviewReportScalarWhereInput[]
    OR?: ReviewReportScalarWhereInput[]
    NOT?: ReviewReportScalarWhereInput | ReviewReportScalarWhereInput[]
    id?: StringFilter<"ReviewReport"> | string
    reviewId?: StringFilter<"ReviewReport"> | string
    reportedBy?: StringFilter<"ReviewReport"> | string
    reason?: StringFilter<"ReviewReport"> | string
    description?: StringNullableFilter<"ReviewReport"> | string | null
    status?: StringFilter<"ReviewReport"> | string
    reviewedBy?: StringNullableFilter<"ReviewReport"> | string | null
    reviewedAt?: DateTimeNullableFilter<"ReviewReport"> | Date | string | null
    createdAt?: DateTimeFilter<"ReviewReport"> | Date | string
  }

  export type ReviewCreateWithoutImagesInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReviewReportCreateNestedManyWithoutReviewInput
  }

  export type ReviewUncheckedCreateWithoutImagesInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    reports?: ReviewReportUncheckedCreateNestedManyWithoutReviewInput
  }

  export type ReviewCreateOrConnectWithoutImagesInput = {
    where: ReviewWhereUniqueInput
    create: XOR<ReviewCreateWithoutImagesInput, ReviewUncheckedCreateWithoutImagesInput>
  }

  export type ReviewUpsertWithoutImagesInput = {
    update: XOR<ReviewUpdateWithoutImagesInput, ReviewUncheckedUpdateWithoutImagesInput>
    create: XOR<ReviewCreateWithoutImagesInput, ReviewUncheckedCreateWithoutImagesInput>
    where?: ReviewWhereInput
  }

  export type ReviewUpdateToOneWithWhereWithoutImagesInput = {
    where?: ReviewWhereInput
    data: XOR<ReviewUpdateWithoutImagesInput, ReviewUncheckedUpdateWithoutImagesInput>
  }

  export type ReviewUpdateWithoutImagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReviewReportUpdateManyWithoutReviewNestedInput
  }

  export type ReviewUncheckedUpdateWithoutImagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reports?: ReviewReportUncheckedUpdateManyWithoutReviewNestedInput
  }

  export type ReviewCreateWithoutReportsInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: ReviewImageCreateNestedManyWithoutReviewInput
  }

  export type ReviewUncheckedCreateWithoutReportsInput = {
    id?: string
    productId: string
    customerId: string
    customerName: string
    orderId: string
    orderItemId: string
    rating: number
    title?: string | null
    content: string
    isVerifiedPurchase?: boolean
    isVisible?: boolean
    isEdited?: boolean
    moderationStatus?: string
    moderationNote?: string | null
    moderatedBy?: string | null
    moderatedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: ReviewImageUncheckedCreateNestedManyWithoutReviewInput
  }

  export type ReviewCreateOrConnectWithoutReportsInput = {
    where: ReviewWhereUniqueInput
    create: XOR<ReviewCreateWithoutReportsInput, ReviewUncheckedCreateWithoutReportsInput>
  }

  export type ReviewUpsertWithoutReportsInput = {
    update: XOR<ReviewUpdateWithoutReportsInput, ReviewUncheckedUpdateWithoutReportsInput>
    create: XOR<ReviewCreateWithoutReportsInput, ReviewUncheckedCreateWithoutReportsInput>
    where?: ReviewWhereInput
  }

  export type ReviewUpdateToOneWithWhereWithoutReportsInput = {
    where?: ReviewWhereInput
    data: XOR<ReviewUpdateWithoutReportsInput, ReviewUncheckedUpdateWithoutReportsInput>
  }

  export type ReviewUpdateWithoutReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: ReviewImageUpdateManyWithoutReviewNestedInput
  }

  export type ReviewUncheckedUpdateWithoutReportsInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    title?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    isVerifiedPurchase?: BoolFieldUpdateOperationsInput | boolean
    isVisible?: BoolFieldUpdateOperationsInput | boolean
    isEdited?: BoolFieldUpdateOperationsInput | boolean
    moderationStatus?: StringFieldUpdateOperationsInput | string
    moderationNote?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: ReviewImageUncheckedUpdateManyWithoutReviewNestedInput
  }

  export type ReviewImageCreateManyReviewInput = {
    id?: string
    url: string
    alt?: string | null
    sortOrder?: number
    createdAt?: Date | string
  }

  export type ReviewReportCreateManyReviewInput = {
    id?: string
    reportedBy: string
    reason: string
    description?: string | null
    status?: string
    reviewedBy?: string | null
    reviewedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ReviewImageUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewImageUncheckedUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewImageUncheckedUpdateManyWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    alt?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewReportUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewReportUncheckedUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewReportUncheckedUpdateManyWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportedBy?: StringFieldUpdateOperationsInput | string
    reason?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    reviewedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ReviewCountOutputTypeDefaultArgs instead
     */
    export type ReviewCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ReviewCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ReviewDefaultArgs instead
     */
    export type ReviewArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ReviewDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ReviewImageDefaultArgs instead
     */
    export type ReviewImageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ReviewImageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ReviewReportDefaultArgs instead
     */
    export type ReviewReportArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ReviewReportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductRatingSummaryDefaultArgs instead
     */
    export type ProductRatingSummaryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductRatingSummaryDefaultArgs<ExtArgs>

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
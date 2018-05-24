import * as $protobuf from 'protobufjs';

/** Properties of a VersionDummy. */
export interface IVersionDummy {}

/** Represents a VersionDummy. */
export class VersionDummy implements IVersionDummy {
  /**
   * Constructs a new VersionDummy.
   * @param [properties] Properties to set
   */
  constructor(properties?: IVersionDummy);

  /**
   * Creates a new VersionDummy instance using the specified properties.
   * @param [properties] Properties to set
   * @returns VersionDummy instance
   */
  public static create(properties?: IVersionDummy): VersionDummy;

  /**
   * Encodes the specified VersionDummy message. Does not implicitly {@link VersionDummy.verify|verify} messages.
   * @param message VersionDummy message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: IVersionDummy,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified VersionDummy message, length delimited. Does not implicitly {@link VersionDummy.verify|verify} messages.
   * @param message VersionDummy message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IVersionDummy,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a VersionDummy message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns VersionDummy
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): VersionDummy;

  /**
   * Decodes a VersionDummy message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns VersionDummy
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array
  ): VersionDummy;

  /**
   * Verifies a VersionDummy message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a VersionDummy message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns VersionDummy
   */
  public static fromObject(object: { [k: string]: any }): VersionDummy;

  /**
   * Creates a plain object from a VersionDummy message. Also converts values to other types if specified.
   * @param message VersionDummy
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: VersionDummy,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this VersionDummy to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

export namespace VersionDummy {
  /** Version enum. */
  enum Version {
    V0_1 = 1063369270,
    V0_2 = 1915781601,
    V0_3 = 1601562686,
    V0_4 = 1074539808,
    V1_0 = 885177795
  }

  /** Protocol enum. */
  enum Protocol {
    PROTOBUF = 656407617,
    JSON = 2120839367
  }
}

/** Properties of a Query. */
export interface IQuery {
  /** Query type */
  type?: Query.QueryType | null;

  /** Query query */
  query?: ITerm | null;

  /** Query token */
  token?: number | Long | null;

  /** Query OBSOLETENoreply */
  OBSOLETENoreply?: boolean | null;

  /** Query acceptsRJson */
  acceptsRJson?: boolean | null;

  /** Query globalOptargs */
  globalOptargs?: Query.IAssocPair[] | null;
}

/** Represents a Query. */
export class Query implements IQuery {
  /**
   * Constructs a new Query.
   * @param [properties] Properties to set
   */
  constructor(properties?: IQuery);

  /** Query type. */
  public type: Query.QueryType;

  /** Query query. */
  public query?: ITerm | null;

  /** Query token. */
  public token: number | Long;

  /** Query OBSOLETENoreply. */
  public OBSOLETENoreply: boolean;

  /** Query acceptsRJson. */
  public acceptsRJson: boolean;

  /** Query globalOptargs. */
  public globalOptargs: Query.IAssocPair[];

  /**
   * Creates a new Query instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Query instance
   */
  public static create(properties?: IQuery): Query;

  /**
   * Encodes the specified Query message. Does not implicitly {@link Query.verify|verify} messages.
   * @param message Query message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: IQuery,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified Query message, length delimited. Does not implicitly {@link Query.verify|verify} messages.
   * @param message Query message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IQuery,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a Query message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Query
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): Query;

  /**
   * Decodes a Query message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Query
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Query;

  /**
   * Verifies a Query message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a Query message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Query
   */
  public static fromObject(object: { [k: string]: any }): Query;

  /**
   * Creates a plain object from a Query message. Also converts values to other types if specified.
   * @param message Query
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: Query,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this Query to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

export namespace Query {
  /** QueryType enum. */
  enum QueryType {
    START = 1,
    CONTINUE = 2,
    STOP = 3,
    NOREPLY_WAIT = 4,
    SERVER_INFO = 5
  }

  /** Properties of an AssocPair. */
  interface IAssocPair {
    /** AssocPair key */
    key?: string | null;

    /** AssocPair val */
    val?: ITerm | null;
  }

  /** Represents an AssocPair. */
  class AssocPair implements IAssocPair {
    /**
     * Constructs a new AssocPair.
     * @param [properties] Properties to set
     */
    constructor(properties?: Query.IAssocPair);

    /** AssocPair key. */
    public key: string;

    /** AssocPair val. */
    public val?: ITerm | null;

    /**
     * Creates a new AssocPair instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AssocPair instance
     */
    public static create(properties?: Query.IAssocPair): Query.AssocPair;

    /**
     * Encodes the specified AssocPair message. Does not implicitly {@link Query.AssocPair.verify|verify} messages.
     * @param message AssocPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: Query.IAssocPair,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified AssocPair message, length delimited. Does not implicitly {@link Query.AssocPair.verify|verify} messages.
     * @param message AssocPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: Query.IAssocPair,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes an AssocPair message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AssocPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): Query.AssocPair;

    /**
     * Decodes an AssocPair message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AssocPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): Query.AssocPair;

    /**
     * Verifies an AssocPair message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an AssocPair message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AssocPair
     */
    public static fromObject(object: { [k: string]: any }): Query.AssocPair;

    /**
     * Creates a plain object from an AssocPair message. Also converts values to other types if specified.
     * @param message AssocPair
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: Query.AssocPair,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this AssocPair to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Properties of a Frame. */
export interface IFrame {
  /** Frame type */
  type?: Frame.FrameType | null;

  /** Frame pos */
  pos?: number | Long | null;

  /** Frame opt */
  opt?: string | null;
}

/** Represents a Frame. */
export class Frame implements IFrame {
  /**
   * Constructs a new Frame.
   * @param [properties] Properties to set
   */
  constructor(properties?: IFrame);

  /** Frame type. */
  public type: Frame.FrameType;

  /** Frame pos. */
  public pos: number | Long;

  /** Frame opt. */
  public opt: string;

  /**
   * Creates a new Frame instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Frame instance
   */
  public static create(properties?: IFrame): Frame;

  /**
   * Encodes the specified Frame message. Does not implicitly {@link Frame.verify|verify} messages.
   * @param message Frame message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: IFrame,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified Frame message, length delimited. Does not implicitly {@link Frame.verify|verify} messages.
   * @param message Frame message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IFrame,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a Frame message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Frame
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): Frame;

  /**
   * Decodes a Frame message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Frame
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Frame;

  /**
   * Verifies a Frame message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a Frame message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Frame
   */
  public static fromObject(object: { [k: string]: any }): Frame;

  /**
   * Creates a plain object from a Frame message. Also converts values to other types if specified.
   * @param message Frame
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: Frame,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this Frame to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

export namespace Frame {
  /** FrameType enum. */
  enum FrameType {
    POS = 1,
    OPT = 2
  }
}

/** Properties of a Backtrace. */
export interface IBacktrace {
  /** Backtrace frames */
  frames?: IFrame[] | null;
}

/** Represents a Backtrace. */
export class Backtrace implements IBacktrace {
  /**
   * Constructs a new Backtrace.
   * @param [properties] Properties to set
   */
  constructor(properties?: IBacktrace);

  /** Backtrace frames. */
  public frames: IFrame[];

  /**
   * Creates a new Backtrace instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Backtrace instance
   */
  public static create(properties?: IBacktrace): Backtrace;

  /**
   * Encodes the specified Backtrace message. Does not implicitly {@link Backtrace.verify|verify} messages.
   * @param message Backtrace message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: IBacktrace,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified Backtrace message, length delimited. Does not implicitly {@link Backtrace.verify|verify} messages.
   * @param message Backtrace message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IBacktrace,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a Backtrace message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Backtrace
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): Backtrace;

  /**
   * Decodes a Backtrace message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Backtrace
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array
  ): Backtrace;

  /**
   * Verifies a Backtrace message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a Backtrace message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Backtrace
   */
  public static fromObject(object: { [k: string]: any }): Backtrace;

  /**
   * Creates a plain object from a Backtrace message. Also converts values to other types if specified.
   * @param message Backtrace
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: Backtrace,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this Backtrace to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

/** Properties of a Response. */
export interface IResponse {
  /** Response type */
  type?: Response.ResponseType | null;

  /** Response errorType */
  errorType?: Response.ErrorType | null;

  /** Response notes */
  notes?: Response.ResponseNote[] | null;

  /** Response token */
  token?: number | Long | null;

  /** Response response */
  response?: IDatum[] | null;

  /** Response backtrace */
  backtrace?: IBacktrace | null;

  /** Response profile */
  profile?: IDatum | null;
}

/** Represents a Response. */
export class Response implements IResponse {
  /**
   * Constructs a new Response.
   * @param [properties] Properties to set
   */
  constructor(properties?: IResponse);

  /** Response type. */
  public type: Response.ResponseType;

  /** Response errorType. */
  public errorType: Response.ErrorType;

  /** Response notes. */
  public notes: Response.ResponseNote[];

  /** Response token. */
  public token: number | Long;

  /** Response response. */
  public response: IDatum[];

  /** Response backtrace. */
  public backtrace?: IBacktrace | null;

  /** Response profile. */
  public profile?: IDatum | null;

  /**
   * Creates a new Response instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Response instance
   */
  public static create(properties?: IResponse): Response;

  /**
   * Encodes the specified Response message. Does not implicitly {@link Response.verify|verify} messages.
   * @param message Response message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: IResponse,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified Response message, length delimited. Does not implicitly {@link Response.verify|verify} messages.
   * @param message Response message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IResponse,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a Response message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Response
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): Response;

  /**
   * Decodes a Response message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Response
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(
    reader: $protobuf.Reader | Uint8Array
  ): Response;

  /**
   * Verifies a Response message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a Response message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Response
   */
  public static fromObject(object: { [k: string]: any }): Response;

  /**
   * Creates a plain object from a Response message. Also converts values to other types if specified.
   * @param message Response
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: Response,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this Response to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

export namespace Response {
  /** ResponseType enum. */
  enum ResponseType {
    SUCCESS_ATOM = 1,
    SUCCESS_SEQUENCE = 2,
    SUCCESS_PARTIAL = 3,
    WAIT_COMPLETE = 4,
    SERVER_INFO = 5,
    CLIENT_ERROR = 16,
    COMPILE_ERROR = 17,
    RUNTIME_ERROR = 18
  }

  /** ErrorType enum. */
  enum ErrorType {
    INTERNAL = 1000000,
    RESOURCE_LIMIT = 2000000,
    QUERY_LOGIC = 3000000,
    NON_EXISTENCE = 3100000,
    OP_FAILED = 4100000,
    OP_INDETERMINATE = 4200000,
    USER = 5000000,
    PERMISSION_ERROR = 6000000
  }

  /** ResponseNote enum. */
  enum ResponseNote {
    SEQUENCE_FEED = 1,
    ATOM_FEED = 2,
    ORDER_BY_LIMIT_FEED = 3,
    UNIONED_FEED = 4,
    INCLUDES_STATES = 5
  }
}

/** Properties of a Datum. */
export interface IDatum {
  /** Datum type */
  type?: Datum.DatumType | null;

  /** Datum rBool */
  rBool?: boolean | null;

  /** Datum rNum */
  rNum?: number | null;

  /** Datum rStr */
  rStr?: string | null;

  /** Datum rArray */
  rArray?: IDatum[] | null;

  /** Datum rObject */
  rObject?: Datum.IAssocPair[] | null;
}

/** Represents a Datum. */
export class Datum implements IDatum {
  /**
   * Constructs a new Datum.
   * @param [properties] Properties to set
   */
  constructor(properties?: IDatum);

  /** Datum type. */
  public type: Datum.DatumType;

  /** Datum rBool. */
  public rBool: boolean;

  /** Datum rNum. */
  public rNum: number;

  /** Datum rStr. */
  public rStr: string;

  /** Datum rArray. */
  public rArray: IDatum[];

  /** Datum rObject. */
  public rObject: Datum.IAssocPair[];

  /**
   * Creates a new Datum instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Datum instance
   */
  public static create(properties?: IDatum): Datum;

  /**
   * Encodes the specified Datum message. Does not implicitly {@link Datum.verify|verify} messages.
   * @param message Datum message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: IDatum,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified Datum message, length delimited. Does not implicitly {@link Datum.verify|verify} messages.
   * @param message Datum message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: IDatum,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a Datum message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Datum
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): Datum;

  /**
   * Decodes a Datum message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Datum
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Datum;

  /**
   * Verifies a Datum message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a Datum message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Datum
   */
  public static fromObject(object: { [k: string]: any }): Datum;

  /**
   * Creates a plain object from a Datum message. Also converts values to other types if specified.
   * @param message Datum
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: Datum,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this Datum to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

export namespace Datum {
  /** DatumType enum. */
  enum DatumType {
    R_NULL = 1,
    R_BOOL = 2,
    R_NUM = 3,
    R_STR = 4,
    R_ARRAY = 5,
    R_OBJECT = 6,
    R_JSON = 7
  }

  /** Properties of an AssocPair. */
  interface IAssocPair {
    /** AssocPair key */
    key?: string | null;

    /** AssocPair val */
    val?: IDatum | null;
  }

  /** Represents an AssocPair. */
  class AssocPair implements IAssocPair {
    /**
     * Constructs a new AssocPair.
     * @param [properties] Properties to set
     */
    constructor(properties?: Datum.IAssocPair);

    /** AssocPair key. */
    public key: string;

    /** AssocPair val. */
    public val?: IDatum | null;

    /**
     * Creates a new AssocPair instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AssocPair instance
     */
    public static create(properties?: Datum.IAssocPair): Datum.AssocPair;

    /**
     * Encodes the specified AssocPair message. Does not implicitly {@link Datum.AssocPair.verify|verify} messages.
     * @param message AssocPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: Datum.IAssocPair,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified AssocPair message, length delimited. Does not implicitly {@link Datum.AssocPair.verify|verify} messages.
     * @param message AssocPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: Datum.IAssocPair,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes an AssocPair message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AssocPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): Datum.AssocPair;

    /**
     * Decodes an AssocPair message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AssocPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): Datum.AssocPair;

    /**
     * Verifies an AssocPair message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an AssocPair message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AssocPair
     */
    public static fromObject(object: { [k: string]: any }): Datum.AssocPair;

    /**
     * Creates a plain object from an AssocPair message. Also converts values to other types if specified.
     * @param message AssocPair
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: Datum.AssocPair,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this AssocPair to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

/** Properties of a Term. */
export interface ITerm {
  /** Term type */
  type?: Term.TermType | null;

  /** Term datum */
  datum?: IDatum | null;

  /** Term args */
  args?: ITerm[] | null;

  /** Term optargs */
  optargs?: Term.IAssocPair[] | null;
}

/** Represents a Term. */
export class Term implements ITerm {
  /**
   * Constructs a new Term.
   * @param [properties] Properties to set
   */
  constructor(properties?: ITerm);

  /** Term type. */
  public type: Term.TermType;

  /** Term datum. */
  public datum?: IDatum | null;

  /** Term args. */
  public args: ITerm[];

  /** Term optargs. */
  public optargs: Term.IAssocPair[];

  /**
   * Creates a new Term instance using the specified properties.
   * @param [properties] Properties to set
   * @returns Term instance
   */
  public static create(properties?: ITerm): Term;

  /**
   * Encodes the specified Term message. Does not implicitly {@link Term.verify|verify} messages.
   * @param message Term message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encode(
    message: ITerm,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Encodes the specified Term message, length delimited. Does not implicitly {@link Term.verify|verify} messages.
   * @param message Term message or plain object to encode
   * @param [writer] Writer to encode to
   * @returns Writer
   */
  public static encodeDelimited(
    message: ITerm,
    writer?: $protobuf.Writer
  ): $protobuf.Writer;

  /**
   * Decodes a Term message from the specified reader or buffer.
   * @param reader Reader or buffer to decode from
   * @param [length] Message length if known beforehand
   * @returns Term
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decode(
    reader: $protobuf.Reader | Uint8Array,
    length?: number
  ): Term;

  /**
   * Decodes a Term message from the specified reader or buffer, length delimited.
   * @param reader Reader or buffer to decode from
   * @returns Term
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): Term;

  /**
   * Verifies a Term message.
   * @param message Plain object to verify
   * @returns `null` if valid, otherwise the reason why it is not
   */
  public static verify(message: { [k: string]: any }): string | null;

  /**
   * Creates a Term message from a plain object. Also converts values to their respective internal types.
   * @param object Plain object
   * @returns Term
   */
  public static fromObject(object: { [k: string]: any }): Term;

  /**
   * Creates a plain object from a Term message. Also converts values to other types if specified.
   * @param message Term
   * @param [options] Conversion options
   * @returns Plain object
   */
  public static toObject(
    message: Term,
    options?: $protobuf.IConversionOptions
  ): { [k: string]: any };

  /**
   * Converts this Term to JSON.
   * @returns JSON object
   */
  public toJSON(): { [k: string]: any };
}

export namespace Term {
  /** TermType enum. */
  enum TermType {
    DATUM = 1,
    MAKE_ARRAY = 2,
    MAKE_OBJ = 3,
    VAR = 10,
    JAVASCRIPT = 11,
    UUID = 169,
    HTTP = 153,
    ERROR = 12,
    IMPLICIT_VAR = 13,
    DB = 14,
    TABLE = 15,
    GET = 16,
    GET_ALL = 78,
    EQ = 17,
    NE = 18,
    LT = 19,
    LE = 20,
    GT = 21,
    GE = 22,
    NOT = 23,
    ADD = 24,
    SUB = 25,
    MUL = 26,
    DIV = 27,
    MOD = 28,
    FLOOR = 183,
    CEIL = 184,
    ROUND = 185,
    APPEND = 29,
    PREPEND = 80,
    DIFFERENCE = 95,
    SET_INSERT = 88,
    SET_INTERSECTION = 89,
    SET_UNION = 90,
    SET_DIFFERENCE = 91,
    SLICE = 30,
    SKIP = 70,
    LIMIT = 71,
    OFFSETS_OF = 87,
    CONTAINS = 93,
    GET_FIELD = 31,
    KEYS = 94,
    VALUES = 186,
    OBJECT = 143,
    HAS_FIELDS = 32,
    WITH_FIELDS = 96,
    PLUCK = 33,
    WITHOUT = 34,
    MERGE = 35,
    BETWEEN_DEPRECATED = 36,
    BETWEEN = 182,
    REDUCE = 37,
    MAP = 38,
    FOLD = 187,
    FILTER = 39,
    CONCAT_MAP = 40,
    ORDER_BY = 41,
    DISTINCT = 42,
    COUNT = 43,
    IS_EMPTY = 86,
    UNION = 44,
    NTH = 45,
    BRACKET = 170,
    INNER_JOIN = 48,
    OUTER_JOIN = 49,
    EQ_JOIN = 50,
    ZIP = 72,
    RANGE = 173,
    INSERT_AT = 82,
    DELETE_AT = 83,
    CHANGE_AT = 84,
    SPLICE_AT = 85,
    COERCE_TO = 51,
    TYPE_OF = 52,
    UPDATE = 53,
    DELETE = 54,
    REPLACE = 55,
    INSERT = 56,
    DB_CREATE = 57,
    DB_DROP = 58,
    DB_LIST = 59,
    TABLE_CREATE = 60,
    TABLE_DROP = 61,
    TABLE_LIST = 62,
    CONFIG = 174,
    STATUS = 175,
    WAIT = 177,
    RECONFIGURE = 176,
    REBALANCE = 179,
    SYNC = 138,
    GRANT = 188,
    INDEX_CREATE = 75,
    INDEX_DROP = 76,
    INDEX_LIST = 77,
    INDEX_STATUS = 139,
    INDEX_WAIT = 140,
    INDEX_RENAME = 156,
    SET_WRITE_HOOK = 189,
    GET_WRITE_HOOK = 190,
    FUNCALL = 64,
    BRANCH = 65,
    OR = 66,
    AND = 67,
    FOR_EACH = 68,
    FUNC = 69,
    ASC = 73,
    DESC = 74,
    INFO = 79,
    MATCH = 97,
    UPCASE = 141,
    DOWNCASE = 142,
    SAMPLE = 81,
    DEFAULT = 92,
    JSON = 98,
    ISO8601 = 99,
    TO_ISO8601 = 100,
    EPOCH_TIME = 101,
    TO_EPOCH_TIME = 102,
    NOW = 103,
    IN_TIMEZONE = 104,
    DURING = 105,
    DATE = 106,
    TIME_OF_DAY = 126,
    TIMEZONE = 127,
    YEAR = 128,
    MONTH = 129,
    DAY = 130,
    DAY_OF_WEEK = 131,
    DAY_OF_YEAR = 132,
    HOURS = 133,
    MINUTES = 134,
    SECONDS = 135,
    TIME = 136,
    MONDAY = 107,
    TUESDAY = 108,
    WEDNESDAY = 109,
    THURSDAY = 110,
    FRIDAY = 111,
    SATURDAY = 112,
    SUNDAY = 113,
    JANUARY = 114,
    FEBRUARY = 115,
    MARCH = 116,
    APRIL = 117,
    MAY = 118,
    JUNE = 119,
    JULY = 120,
    AUGUST = 121,
    SEPTEMBER = 122,
    OCTOBER = 123,
    NOVEMBER = 124,
    DECEMBER = 125,
    LITERAL = 137,
    GROUP = 144,
    SUM = 145,
    AVG = 146,
    MIN = 147,
    MAX = 148,
    SPLIT = 149,
    UNGROUP = 150,
    RANDOM = 151,
    CHANGES = 152,
    ARGS = 154,
    BINARY = 155,
    GEOJSON = 157,
    TO_GEOJSON = 158,
    POINT = 159,
    LINE = 160,
    POLYGON = 161,
    DISTANCE = 162,
    INTERSECTS = 163,
    INCLUDES = 164,
    CIRCLE = 165,
    GET_INTERSECTING = 166,
    FILL = 167,
    GET_NEAREST = 168,
    POLYGON_SUB = 171,
    TO_JSON_STRING = 172,
    MINVAL = 180,
    MAXVAL = 181,
    BIT_AND = 191,
    BIT_OR = 192,
    BIT_XOR = 193,
    BIT_NOT = 194,
    BIT_SAL = 195,
    BIT_SAR = 196
  }

  /** Properties of an AssocPair. */
  interface IAssocPair {
    /** AssocPair key */
    key?: string | null;

    /** AssocPair val */
    val?: ITerm | null;
  }

  /** Represents an AssocPair. */
  class AssocPair implements IAssocPair {
    /**
     * Constructs a new AssocPair.
     * @param [properties] Properties to set
     */
    constructor(properties?: Term.IAssocPair);

    /** AssocPair key. */
    public key: string;

    /** AssocPair val. */
    public val?: ITerm | null;

    /**
     * Creates a new AssocPair instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AssocPair instance
     */
    public static create(properties?: Term.IAssocPair): Term.AssocPair;

    /**
     * Encodes the specified AssocPair message. Does not implicitly {@link Term.AssocPair.verify|verify} messages.
     * @param message AssocPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(
      message: Term.IAssocPair,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified AssocPair message, length delimited. Does not implicitly {@link Term.AssocPair.verify|verify} messages.
     * @param message AssocPair message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(
      message: Term.IAssocPair,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes an AssocPair message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AssocPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): Term.AssocPair;

    /**
     * Decodes an AssocPair message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AssocPair
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): Term.AssocPair;

    /**
     * Verifies an AssocPair message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an AssocPair message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AssocPair
     */
    public static fromObject(object: { [k: string]: any }): Term.AssocPair;

    /**
     * Creates a plain object from an AssocPair message. Also converts values to other types if specified.
     * @param message AssocPair
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(
      message: Term.AssocPair,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this AssocPair to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
  }
}

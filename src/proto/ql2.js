/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.VersionDummy = (function() {

    /**
     * Properties of a VersionDummy.
     * @exports IVersionDummy
     * @interface IVersionDummy
     */

    /**
     * Constructs a new VersionDummy.
     * @exports VersionDummy
     * @classdesc Represents a VersionDummy.
     * @implements IVersionDummy
     * @constructor
     * @param {IVersionDummy=} [properties] Properties to set
     */
    function VersionDummy(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new VersionDummy instance using the specified properties.
     * @function create
     * @memberof VersionDummy
     * @static
     * @param {IVersionDummy=} [properties] Properties to set
     * @returns {VersionDummy} VersionDummy instance
     */
    VersionDummy.create = function create(properties) {
        return new VersionDummy(properties);
    };

    /**
     * Encodes the specified VersionDummy message. Does not implicitly {@link VersionDummy.verify|verify} messages.
     * @function encode
     * @memberof VersionDummy
     * @static
     * @param {IVersionDummy} message VersionDummy message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VersionDummy.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified VersionDummy message, length delimited. Does not implicitly {@link VersionDummy.verify|verify} messages.
     * @function encodeDelimited
     * @memberof VersionDummy
     * @static
     * @param {IVersionDummy} message VersionDummy message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    VersionDummy.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a VersionDummy message from the specified reader or buffer.
     * @function decode
     * @memberof VersionDummy
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {VersionDummy} VersionDummy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VersionDummy.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.VersionDummy();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a VersionDummy message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof VersionDummy
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {VersionDummy} VersionDummy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    VersionDummy.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a VersionDummy message.
     * @function verify
     * @memberof VersionDummy
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    VersionDummy.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a VersionDummy message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof VersionDummy
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {VersionDummy} VersionDummy
     */
    VersionDummy.fromObject = function fromObject(object) {
        if (object instanceof $root.VersionDummy)
            return object;
        return new $root.VersionDummy();
    };

    /**
     * Creates a plain object from a VersionDummy message. Also converts values to other types if specified.
     * @function toObject
     * @memberof VersionDummy
     * @static
     * @param {VersionDummy} message VersionDummy
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    VersionDummy.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this VersionDummy to JSON.
     * @function toJSON
     * @memberof VersionDummy
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    VersionDummy.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Version enum.
     * @name VersionDummy.Version
     * @enum {string}
     * @property {number} V0_1=1063369270 V0_1 value
     * @property {number} V0_2=1915781601 V0_2 value
     * @property {number} V0_3=1601562686 V0_3 value
     * @property {number} V0_4=1074539808 V0_4 value
     * @property {number} V1_0=885177795 V1_0 value
     */
    VersionDummy.Version = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1063369270] = "V0_1"] = 1063369270;
        values[valuesById[1915781601] = "V0_2"] = 1915781601;
        values[valuesById[1601562686] = "V0_3"] = 1601562686;
        values[valuesById[1074539808] = "V0_4"] = 1074539808;
        values[valuesById[885177795] = "V1_0"] = 885177795;
        return values;
    })();

    /**
     * Protocol enum.
     * @name VersionDummy.Protocol
     * @enum {string}
     * @property {number} PROTOBUF=656407617 PROTOBUF value
     * @property {number} JSON=2120839367 JSON value
     */
    VersionDummy.Protocol = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[656407617] = "PROTOBUF"] = 656407617;
        values[valuesById[2120839367] = "JSON"] = 2120839367;
        return values;
    })();

    return VersionDummy;
})();

$root.Query = (function() {

    /**
     * Properties of a Query.
     * @exports IQuery
     * @interface IQuery
     * @property {Query.QueryType|null} [type] Query type
     * @property {ITerm|null} [query] Query query
     * @property {number|Long|null} [token] Query token
     * @property {boolean|null} [OBSOLETENoreply] Query OBSOLETENoreply
     * @property {boolean|null} [acceptsRJson] Query acceptsRJson
     * @property {Array.<Query.IAssocPair>|null} [globalOptargs] Query globalOptargs
     */

    /**
     * Constructs a new Query.
     * @exports Query
     * @classdesc Represents a Query.
     * @implements IQuery
     * @constructor
     * @param {IQuery=} [properties] Properties to set
     */
    function Query(properties) {
        this.globalOptargs = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Query type.
     * @member {Query.QueryType} type
     * @memberof Query
     * @instance
     */
    Query.prototype.type = 1;

    /**
     * Query query.
     * @member {ITerm|null|undefined} query
     * @memberof Query
     * @instance
     */
    Query.prototype.query = null;

    /**
     * Query token.
     * @member {number|Long} token
     * @memberof Query
     * @instance
     */
    Query.prototype.token = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * Query OBSOLETENoreply.
     * @member {boolean} OBSOLETENoreply
     * @memberof Query
     * @instance
     */
    Query.prototype.OBSOLETENoreply = false;

    /**
     * Query acceptsRJson.
     * @member {boolean} acceptsRJson
     * @memberof Query
     * @instance
     */
    Query.prototype.acceptsRJson = false;

    /**
     * Query globalOptargs.
     * @member {Array.<Query.IAssocPair>} globalOptargs
     * @memberof Query
     * @instance
     */
    Query.prototype.globalOptargs = $util.emptyArray;

    /**
     * Creates a new Query instance using the specified properties.
     * @function create
     * @memberof Query
     * @static
     * @param {IQuery=} [properties] Properties to set
     * @returns {Query} Query instance
     */
    Query.create = function create(properties) {
        return new Query(properties);
    };

    /**
     * Encodes the specified Query message. Does not implicitly {@link Query.verify|verify} messages.
     * @function encode
     * @memberof Query
     * @static
     * @param {IQuery} message Query message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Query.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty("type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.query != null && message.hasOwnProperty("query"))
            $root.Term.encode(message.query, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.token != null && message.hasOwnProperty("token"))
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.token);
        if (message.OBSOLETENoreply != null && message.hasOwnProperty("OBSOLETENoreply"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.OBSOLETENoreply);
        if (message.acceptsRJson != null && message.hasOwnProperty("acceptsRJson"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.acceptsRJson);
        if (message.globalOptargs != null && message.globalOptargs.length)
            for (var i = 0; i < message.globalOptargs.length; ++i)
                $root.Query.AssocPair.encode(message.globalOptargs[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Query message, length delimited. Does not implicitly {@link Query.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Query
     * @static
     * @param {IQuery} message Query message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Query.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Query message from the specified reader or buffer.
     * @function decode
     * @memberof Query
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Query} Query
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Query.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Query();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.type = reader.int32();
                break;
            case 2:
                message.query = $root.Term.decode(reader, reader.uint32());
                break;
            case 3:
                message.token = reader.int64();
                break;
            case 4:
                message.OBSOLETENoreply = reader.bool();
                break;
            case 5:
                message.acceptsRJson = reader.bool();
                break;
            case 6:
                if (!(message.globalOptargs && message.globalOptargs.length))
                    message.globalOptargs = [];
                message.globalOptargs.push($root.Query.AssocPair.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Query message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Query
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Query} Query
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Query.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Query message.
     * @function verify
     * @memberof Query
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Query.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            }
        if (message.query != null && message.hasOwnProperty("query")) {
            var error = $root.Term.verify(message.query);
            if (error)
                return "query." + error;
        }
        if (message.token != null && message.hasOwnProperty("token"))
            if (!$util.isInteger(message.token) && !(message.token && $util.isInteger(message.token.low) && $util.isInteger(message.token.high)))
                return "token: integer|Long expected";
        if (message.OBSOLETENoreply != null && message.hasOwnProperty("OBSOLETENoreply"))
            if (typeof message.OBSOLETENoreply !== "boolean")
                return "OBSOLETENoreply: boolean expected";
        if (message.acceptsRJson != null && message.hasOwnProperty("acceptsRJson"))
            if (typeof message.acceptsRJson !== "boolean")
                return "acceptsRJson: boolean expected";
        if (message.globalOptargs != null && message.hasOwnProperty("globalOptargs")) {
            if (!Array.isArray(message.globalOptargs))
                return "globalOptargs: array expected";
            for (var i = 0; i < message.globalOptargs.length; ++i) {
                var error = $root.Query.AssocPair.verify(message.globalOptargs[i]);
                if (error)
                    return "globalOptargs." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Query message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Query
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Query} Query
     */
    Query.fromObject = function fromObject(object) {
        if (object instanceof $root.Query)
            return object;
        var message = new $root.Query();
        switch (object.type) {
        case "START":
        case 1:
            message.type = 1;
            break;
        case "CONTINUE":
        case 2:
            message.type = 2;
            break;
        case "STOP":
        case 3:
            message.type = 3;
            break;
        case "NOREPLY_WAIT":
        case 4:
            message.type = 4;
            break;
        case "SERVER_INFO":
        case 5:
            message.type = 5;
            break;
        }
        if (object.query != null) {
            if (typeof object.query !== "object")
                throw TypeError(".Query.query: object expected");
            message.query = $root.Term.fromObject(object.query);
        }
        if (object.token != null)
            if ($util.Long)
                (message.token = $util.Long.fromValue(object.token)).unsigned = false;
            else if (typeof object.token === "string")
                message.token = parseInt(object.token, 10);
            else if (typeof object.token === "number")
                message.token = object.token;
            else if (typeof object.token === "object")
                message.token = new $util.LongBits(object.token.low >>> 0, object.token.high >>> 0).toNumber();
        if (object.OBSOLETENoreply != null)
            message.OBSOLETENoreply = Boolean(object.OBSOLETENoreply);
        if (object.acceptsRJson != null)
            message.acceptsRJson = Boolean(object.acceptsRJson);
        if (object.globalOptargs) {
            if (!Array.isArray(object.globalOptargs))
                throw TypeError(".Query.globalOptargs: array expected");
            message.globalOptargs = [];
            for (var i = 0; i < object.globalOptargs.length; ++i) {
                if (typeof object.globalOptargs[i] !== "object")
                    throw TypeError(".Query.globalOptargs: object expected");
                message.globalOptargs[i] = $root.Query.AssocPair.fromObject(object.globalOptargs[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Query message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Query
     * @static
     * @param {Query} message Query
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Query.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.globalOptargs = [];
        if (options.defaults) {
            object.type = options.enums === String ? "START" : 1;
            object.query = null;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.token = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.token = options.longs === String ? "0" : 0;
            object.OBSOLETENoreply = false;
            object.acceptsRJson = false;
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.Query.QueryType[message.type] : message.type;
        if (message.query != null && message.hasOwnProperty("query"))
            object.query = $root.Term.toObject(message.query, options);
        if (message.token != null && message.hasOwnProperty("token"))
            if (typeof message.token === "number")
                object.token = options.longs === String ? String(message.token) : message.token;
            else
                object.token = options.longs === String ? $util.Long.prototype.toString.call(message.token) : options.longs === Number ? new $util.LongBits(message.token.low >>> 0, message.token.high >>> 0).toNumber() : message.token;
        if (message.OBSOLETENoreply != null && message.hasOwnProperty("OBSOLETENoreply"))
            object.OBSOLETENoreply = message.OBSOLETENoreply;
        if (message.acceptsRJson != null && message.hasOwnProperty("acceptsRJson"))
            object.acceptsRJson = message.acceptsRJson;
        if (message.globalOptargs && message.globalOptargs.length) {
            object.globalOptargs = [];
            for (var j = 0; j < message.globalOptargs.length; ++j)
                object.globalOptargs[j] = $root.Query.AssocPair.toObject(message.globalOptargs[j], options);
        }
        return object;
    };

    /**
     * Converts this Query to JSON.
     * @function toJSON
     * @memberof Query
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Query.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * QueryType enum.
     * @name Query.QueryType
     * @enum {string}
     * @property {number} START=1 START value
     * @property {number} CONTINUE=2 CONTINUE value
     * @property {number} STOP=3 STOP value
     * @property {number} NOREPLY_WAIT=4 NOREPLY_WAIT value
     * @property {number} SERVER_INFO=5 SERVER_INFO value
     */
    Query.QueryType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "START"] = 1;
        values[valuesById[2] = "CONTINUE"] = 2;
        values[valuesById[3] = "STOP"] = 3;
        values[valuesById[4] = "NOREPLY_WAIT"] = 4;
        values[valuesById[5] = "SERVER_INFO"] = 5;
        return values;
    })();

    Query.AssocPair = (function() {

        /**
         * Properties of an AssocPair.
         * @memberof Query
         * @interface IAssocPair
         * @property {string|null} [key] AssocPair key
         * @property {ITerm|null} [val] AssocPair val
         */

        /**
         * Constructs a new AssocPair.
         * @memberof Query
         * @classdesc Represents an AssocPair.
         * @implements IAssocPair
         * @constructor
         * @param {Query.IAssocPair=} [properties] Properties to set
         */
        function AssocPair(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AssocPair key.
         * @member {string} key
         * @memberof Query.AssocPair
         * @instance
         */
        AssocPair.prototype.key = "";

        /**
         * AssocPair val.
         * @member {ITerm|null|undefined} val
         * @memberof Query.AssocPair
         * @instance
         */
        AssocPair.prototype.val = null;

        /**
         * Creates a new AssocPair instance using the specified properties.
         * @function create
         * @memberof Query.AssocPair
         * @static
         * @param {Query.IAssocPair=} [properties] Properties to set
         * @returns {Query.AssocPair} AssocPair instance
         */
        AssocPair.create = function create(properties) {
            return new AssocPair(properties);
        };

        /**
         * Encodes the specified AssocPair message. Does not implicitly {@link Query.AssocPair.verify|verify} messages.
         * @function encode
         * @memberof Query.AssocPair
         * @static
         * @param {Query.IAssocPair} message AssocPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssocPair.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && message.hasOwnProperty("key"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
            if (message.val != null && message.hasOwnProperty("val"))
                $root.Term.encode(message.val, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AssocPair message, length delimited. Does not implicitly {@link Query.AssocPair.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Query.AssocPair
         * @static
         * @param {Query.IAssocPair} message AssocPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssocPair.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AssocPair message from the specified reader or buffer.
         * @function decode
         * @memberof Query.AssocPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Query.AssocPair} AssocPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssocPair.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Query.AssocPair();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.val = $root.Term.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AssocPair message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Query.AssocPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Query.AssocPair} AssocPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssocPair.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AssocPair message.
         * @function verify
         * @memberof Query.AssocPair
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AssocPair.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!$util.isString(message.key))
                    return "key: string expected";
            if (message.val != null && message.hasOwnProperty("val")) {
                var error = $root.Term.verify(message.val);
                if (error)
                    return "val." + error;
            }
            return null;
        };

        /**
         * Creates an AssocPair message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Query.AssocPair
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Query.AssocPair} AssocPair
         */
        AssocPair.fromObject = function fromObject(object) {
            if (object instanceof $root.Query.AssocPair)
                return object;
            var message = new $root.Query.AssocPair();
            if (object.key != null)
                message.key = String(object.key);
            if (object.val != null) {
                if (typeof object.val !== "object")
                    throw TypeError(".Query.AssocPair.val: object expected");
                message.val = $root.Term.fromObject(object.val);
            }
            return message;
        };

        /**
         * Creates a plain object from an AssocPair message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Query.AssocPair
         * @static
         * @param {Query.AssocPair} message AssocPair
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AssocPair.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.key = "";
                object.val = null;
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.val != null && message.hasOwnProperty("val"))
                object.val = $root.Term.toObject(message.val, options);
            return object;
        };

        /**
         * Converts this AssocPair to JSON.
         * @function toJSON
         * @memberof Query.AssocPair
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AssocPair.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AssocPair;
    })();

    return Query;
})();

$root.Frame = (function() {

    /**
     * Properties of a Frame.
     * @exports IFrame
     * @interface IFrame
     * @property {Frame.FrameType|null} [type] Frame type
     * @property {number|Long|null} [pos] Frame pos
     * @property {string|null} [opt] Frame opt
     */

    /**
     * Constructs a new Frame.
     * @exports Frame
     * @classdesc Represents a Frame.
     * @implements IFrame
     * @constructor
     * @param {IFrame=} [properties] Properties to set
     */
    function Frame(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Frame type.
     * @member {Frame.FrameType} type
     * @memberof Frame
     * @instance
     */
    Frame.prototype.type = 1;

    /**
     * Frame pos.
     * @member {number|Long} pos
     * @memberof Frame
     * @instance
     */
    Frame.prototype.pos = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * Frame opt.
     * @member {string} opt
     * @memberof Frame
     * @instance
     */
    Frame.prototype.opt = "";

    /**
     * Creates a new Frame instance using the specified properties.
     * @function create
     * @memberof Frame
     * @static
     * @param {IFrame=} [properties] Properties to set
     * @returns {Frame} Frame instance
     */
    Frame.create = function create(properties) {
        return new Frame(properties);
    };

    /**
     * Encodes the specified Frame message. Does not implicitly {@link Frame.verify|verify} messages.
     * @function encode
     * @memberof Frame
     * @static
     * @param {IFrame} message Frame message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Frame.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty("type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.pos != null && message.hasOwnProperty("pos"))
            writer.uint32(/* id 2, wireType 0 =*/16).int64(message.pos);
        if (message.opt != null && message.hasOwnProperty("opt"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.opt);
        return writer;
    };

    /**
     * Encodes the specified Frame message, length delimited. Does not implicitly {@link Frame.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Frame
     * @static
     * @param {IFrame} message Frame message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Frame.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Frame message from the specified reader or buffer.
     * @function decode
     * @memberof Frame
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Frame} Frame
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Frame.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Frame();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.type = reader.int32();
                break;
            case 2:
                message.pos = reader.int64();
                break;
            case 3:
                message.opt = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Frame message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Frame
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Frame} Frame
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Frame.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Frame message.
     * @function verify
     * @memberof Frame
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Frame.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
                break;
            }
        if (message.pos != null && message.hasOwnProperty("pos"))
            if (!$util.isInteger(message.pos) && !(message.pos && $util.isInteger(message.pos.low) && $util.isInteger(message.pos.high)))
                return "pos: integer|Long expected";
        if (message.opt != null && message.hasOwnProperty("opt"))
            if (!$util.isString(message.opt))
                return "opt: string expected";
        return null;
    };

    /**
     * Creates a Frame message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Frame
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Frame} Frame
     */
    Frame.fromObject = function fromObject(object) {
        if (object instanceof $root.Frame)
            return object;
        var message = new $root.Frame();
        switch (object.type) {
        case "POS":
        case 1:
            message.type = 1;
            break;
        case "OPT":
        case 2:
            message.type = 2;
            break;
        }
        if (object.pos != null)
            if ($util.Long)
                (message.pos = $util.Long.fromValue(object.pos)).unsigned = false;
            else if (typeof object.pos === "string")
                message.pos = parseInt(object.pos, 10);
            else if (typeof object.pos === "number")
                message.pos = object.pos;
            else if (typeof object.pos === "object")
                message.pos = new $util.LongBits(object.pos.low >>> 0, object.pos.high >>> 0).toNumber();
        if (object.opt != null)
            message.opt = String(object.opt);
        return message;
    };

    /**
     * Creates a plain object from a Frame message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Frame
     * @static
     * @param {Frame} message Frame
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Frame.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.type = options.enums === String ? "POS" : 1;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.pos = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.pos = options.longs === String ? "0" : 0;
            object.opt = "";
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.Frame.FrameType[message.type] : message.type;
        if (message.pos != null && message.hasOwnProperty("pos"))
            if (typeof message.pos === "number")
                object.pos = options.longs === String ? String(message.pos) : message.pos;
            else
                object.pos = options.longs === String ? $util.Long.prototype.toString.call(message.pos) : options.longs === Number ? new $util.LongBits(message.pos.low >>> 0, message.pos.high >>> 0).toNumber() : message.pos;
        if (message.opt != null && message.hasOwnProperty("opt"))
            object.opt = message.opt;
        return object;
    };

    /**
     * Converts this Frame to JSON.
     * @function toJSON
     * @memberof Frame
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Frame.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * FrameType enum.
     * @name Frame.FrameType
     * @enum {string}
     * @property {number} POS=1 POS value
     * @property {number} OPT=2 OPT value
     */
    Frame.FrameType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "POS"] = 1;
        values[valuesById[2] = "OPT"] = 2;
        return values;
    })();

    return Frame;
})();

$root.Backtrace = (function() {

    /**
     * Properties of a Backtrace.
     * @exports IBacktrace
     * @interface IBacktrace
     * @property {Array.<IFrame>|null} [frames] Backtrace frames
     */

    /**
     * Constructs a new Backtrace.
     * @exports Backtrace
     * @classdesc Represents a Backtrace.
     * @implements IBacktrace
     * @constructor
     * @param {IBacktrace=} [properties] Properties to set
     */
    function Backtrace(properties) {
        this.frames = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Backtrace frames.
     * @member {Array.<IFrame>} frames
     * @memberof Backtrace
     * @instance
     */
    Backtrace.prototype.frames = $util.emptyArray;

    /**
     * Creates a new Backtrace instance using the specified properties.
     * @function create
     * @memberof Backtrace
     * @static
     * @param {IBacktrace=} [properties] Properties to set
     * @returns {Backtrace} Backtrace instance
     */
    Backtrace.create = function create(properties) {
        return new Backtrace(properties);
    };

    /**
     * Encodes the specified Backtrace message. Does not implicitly {@link Backtrace.verify|verify} messages.
     * @function encode
     * @memberof Backtrace
     * @static
     * @param {IBacktrace} message Backtrace message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Backtrace.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.frames != null && message.frames.length)
            for (var i = 0; i < message.frames.length; ++i)
                $root.Frame.encode(message.frames[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Backtrace message, length delimited. Does not implicitly {@link Backtrace.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Backtrace
     * @static
     * @param {IBacktrace} message Backtrace message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Backtrace.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Backtrace message from the specified reader or buffer.
     * @function decode
     * @memberof Backtrace
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Backtrace} Backtrace
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Backtrace.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Backtrace();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.frames && message.frames.length))
                    message.frames = [];
                message.frames.push($root.Frame.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Backtrace message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Backtrace
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Backtrace} Backtrace
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Backtrace.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Backtrace message.
     * @function verify
     * @memberof Backtrace
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Backtrace.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.frames != null && message.hasOwnProperty("frames")) {
            if (!Array.isArray(message.frames))
                return "frames: array expected";
            for (var i = 0; i < message.frames.length; ++i) {
                var error = $root.Frame.verify(message.frames[i]);
                if (error)
                    return "frames." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Backtrace message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Backtrace
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Backtrace} Backtrace
     */
    Backtrace.fromObject = function fromObject(object) {
        if (object instanceof $root.Backtrace)
            return object;
        var message = new $root.Backtrace();
        if (object.frames) {
            if (!Array.isArray(object.frames))
                throw TypeError(".Backtrace.frames: array expected");
            message.frames = [];
            for (var i = 0; i < object.frames.length; ++i) {
                if (typeof object.frames[i] !== "object")
                    throw TypeError(".Backtrace.frames: object expected");
                message.frames[i] = $root.Frame.fromObject(object.frames[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Backtrace message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Backtrace
     * @static
     * @param {Backtrace} message Backtrace
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Backtrace.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.frames = [];
        if (message.frames && message.frames.length) {
            object.frames = [];
            for (var j = 0; j < message.frames.length; ++j)
                object.frames[j] = $root.Frame.toObject(message.frames[j], options);
        }
        return object;
    };

    /**
     * Converts this Backtrace to JSON.
     * @function toJSON
     * @memberof Backtrace
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Backtrace.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Backtrace;
})();

$root.Response = (function() {

    /**
     * Properties of a Response.
     * @exports IResponse
     * @interface IResponse
     * @property {Response.ResponseType|null} [type] Response type
     * @property {Response.ErrorType|null} [errorType] Response errorType
     * @property {Array.<Response.ResponseNote>|null} [notes] Response notes
     * @property {number|Long|null} [token] Response token
     * @property {Array.<IDatum>|null} [response] Response response
     * @property {IBacktrace|null} [backtrace] Response backtrace
     * @property {IDatum|null} [profile] Response profile
     */

    /**
     * Constructs a new Response.
     * @exports Response
     * @classdesc Represents a Response.
     * @implements IResponse
     * @constructor
     * @param {IResponse=} [properties] Properties to set
     */
    function Response(properties) {
        this.notes = [];
        this.response = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Response type.
     * @member {Response.ResponseType} type
     * @memberof Response
     * @instance
     */
    Response.prototype.type = 1;

    /**
     * Response errorType.
     * @member {Response.ErrorType} errorType
     * @memberof Response
     * @instance
     */
    Response.prototype.errorType = 1000000;

    /**
     * Response notes.
     * @member {Array.<Response.ResponseNote>} notes
     * @memberof Response
     * @instance
     */
    Response.prototype.notes = $util.emptyArray;

    /**
     * Response token.
     * @member {number|Long} token
     * @memberof Response
     * @instance
     */
    Response.prototype.token = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

    /**
     * Response response.
     * @member {Array.<IDatum>} response
     * @memberof Response
     * @instance
     */
    Response.prototype.response = $util.emptyArray;

    /**
     * Response backtrace.
     * @member {IBacktrace|null|undefined} backtrace
     * @memberof Response
     * @instance
     */
    Response.prototype.backtrace = null;

    /**
     * Response profile.
     * @member {IDatum|null|undefined} profile
     * @memberof Response
     * @instance
     */
    Response.prototype.profile = null;

    /**
     * Creates a new Response instance using the specified properties.
     * @function create
     * @memberof Response
     * @static
     * @param {IResponse=} [properties] Properties to set
     * @returns {Response} Response instance
     */
    Response.create = function create(properties) {
        return new Response(properties);
    };

    /**
     * Encodes the specified Response message. Does not implicitly {@link Response.verify|verify} messages.
     * @function encode
     * @memberof Response
     * @static
     * @param {IResponse} message Response message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Response.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty("type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.token != null && message.hasOwnProperty("token"))
            writer.uint32(/* id 2, wireType 0 =*/16).int64(message.token);
        if (message.response != null && message.response.length)
            for (var i = 0; i < message.response.length; ++i)
                $root.Datum.encode(message.response[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.backtrace != null && message.hasOwnProperty("backtrace"))
            $root.Backtrace.encode(message.backtrace, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.profile != null && message.hasOwnProperty("profile"))
            $root.Datum.encode(message.profile, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.notes != null && message.notes.length)
            for (var i = 0; i < message.notes.length; ++i)
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.notes[i]);
        if (message.errorType != null && message.hasOwnProperty("errorType"))
            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.errorType);
        return writer;
    };

    /**
     * Encodes the specified Response message, length delimited. Does not implicitly {@link Response.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Response
     * @static
     * @param {IResponse} message Response message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Response.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Response message from the specified reader or buffer.
     * @function decode
     * @memberof Response
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Response} Response
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Response.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Response();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.type = reader.int32();
                break;
            case 7:
                message.errorType = reader.int32();
                break;
            case 6:
                if (!(message.notes && message.notes.length))
                    message.notes = [];
                if ((tag & 7) === 2) {
                    var end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.notes.push(reader.int32());
                } else
                    message.notes.push(reader.int32());
                break;
            case 2:
                message.token = reader.int64();
                break;
            case 3:
                if (!(message.response && message.response.length))
                    message.response = [];
                message.response.push($root.Datum.decode(reader, reader.uint32()));
                break;
            case 4:
                message.backtrace = $root.Backtrace.decode(reader, reader.uint32());
                break;
            case 5:
                message.profile = $root.Datum.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Response message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Response
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Response} Response
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Response.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Response message.
     * @function verify
     * @memberof Response
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Response.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 16:
            case 17:
            case 18:
                break;
            }
        if (message.errorType != null && message.hasOwnProperty("errorType"))
            switch (message.errorType) {
            default:
                return "errorType: enum value expected";
            case 1000000:
            case 2000000:
            case 3000000:
            case 3100000:
            case 4100000:
            case 4200000:
            case 5000000:
            case 6000000:
                break;
            }
        if (message.notes != null && message.hasOwnProperty("notes")) {
            if (!Array.isArray(message.notes))
                return "notes: array expected";
            for (var i = 0; i < message.notes.length; ++i)
                switch (message.notes[i]) {
                default:
                    return "notes: enum value[] expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
        }
        if (message.token != null && message.hasOwnProperty("token"))
            if (!$util.isInteger(message.token) && !(message.token && $util.isInteger(message.token.low) && $util.isInteger(message.token.high)))
                return "token: integer|Long expected";
        if (message.response != null && message.hasOwnProperty("response")) {
            if (!Array.isArray(message.response))
                return "response: array expected";
            for (var i = 0; i < message.response.length; ++i) {
                var error = $root.Datum.verify(message.response[i]);
                if (error)
                    return "response." + error;
            }
        }
        if (message.backtrace != null && message.hasOwnProperty("backtrace")) {
            var error = $root.Backtrace.verify(message.backtrace);
            if (error)
                return "backtrace." + error;
        }
        if (message.profile != null && message.hasOwnProperty("profile")) {
            var error = $root.Datum.verify(message.profile);
            if (error)
                return "profile." + error;
        }
        return null;
    };

    /**
     * Creates a Response message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Response
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Response} Response
     */
    Response.fromObject = function fromObject(object) {
        if (object instanceof $root.Response)
            return object;
        var message = new $root.Response();
        switch (object.type) {
        case "SUCCESS_ATOM":
        case 1:
            message.type = 1;
            break;
        case "SUCCESS_SEQUENCE":
        case 2:
            message.type = 2;
            break;
        case "SUCCESS_PARTIAL":
        case 3:
            message.type = 3;
            break;
        case "WAIT_COMPLETE":
        case 4:
            message.type = 4;
            break;
        case "SERVER_INFO":
        case 5:
            message.type = 5;
            break;
        case "CLIENT_ERROR":
        case 16:
            message.type = 16;
            break;
        case "COMPILE_ERROR":
        case 17:
            message.type = 17;
            break;
        case "RUNTIME_ERROR":
        case 18:
            message.type = 18;
            break;
        }
        switch (object.errorType) {
        case "INTERNAL":
        case 1000000:
            message.errorType = 1000000;
            break;
        case "RESOURCE_LIMIT":
        case 2000000:
            message.errorType = 2000000;
            break;
        case "QUERY_LOGIC":
        case 3000000:
            message.errorType = 3000000;
            break;
        case "NON_EXISTENCE":
        case 3100000:
            message.errorType = 3100000;
            break;
        case "OP_FAILED":
        case 4100000:
            message.errorType = 4100000;
            break;
        case "OP_INDETERMINATE":
        case 4200000:
            message.errorType = 4200000;
            break;
        case "USER":
        case 5000000:
            message.errorType = 5000000;
            break;
        case "PERMISSION_ERROR":
        case 6000000:
            message.errorType = 6000000;
            break;
        }
        if (object.notes) {
            if (!Array.isArray(object.notes))
                throw TypeError(".Response.notes: array expected");
            message.notes = [];
            for (var i = 0; i < object.notes.length; ++i)
                switch (object.notes[i]) {
                default:
                case "SEQUENCE_FEED":
                case 1:
                    message.notes[i] = 1;
                    break;
                case "ATOM_FEED":
                case 2:
                    message.notes[i] = 2;
                    break;
                case "ORDER_BY_LIMIT_FEED":
                case 3:
                    message.notes[i] = 3;
                    break;
                case "UNIONED_FEED":
                case 4:
                    message.notes[i] = 4;
                    break;
                case "INCLUDES_STATES":
                case 5:
                    message.notes[i] = 5;
                    break;
                }
        }
        if (object.token != null)
            if ($util.Long)
                (message.token = $util.Long.fromValue(object.token)).unsigned = false;
            else if (typeof object.token === "string")
                message.token = parseInt(object.token, 10);
            else if (typeof object.token === "number")
                message.token = object.token;
            else if (typeof object.token === "object")
                message.token = new $util.LongBits(object.token.low >>> 0, object.token.high >>> 0).toNumber();
        if (object.response) {
            if (!Array.isArray(object.response))
                throw TypeError(".Response.response: array expected");
            message.response = [];
            for (var i = 0; i < object.response.length; ++i) {
                if (typeof object.response[i] !== "object")
                    throw TypeError(".Response.response: object expected");
                message.response[i] = $root.Datum.fromObject(object.response[i]);
            }
        }
        if (object.backtrace != null) {
            if (typeof object.backtrace !== "object")
                throw TypeError(".Response.backtrace: object expected");
            message.backtrace = $root.Backtrace.fromObject(object.backtrace);
        }
        if (object.profile != null) {
            if (typeof object.profile !== "object")
                throw TypeError(".Response.profile: object expected");
            message.profile = $root.Datum.fromObject(object.profile);
        }
        return message;
    };

    /**
     * Creates a plain object from a Response message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Response
     * @static
     * @param {Response} message Response
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Response.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.response = [];
            object.notes = [];
        }
        if (options.defaults) {
            object.type = options.enums === String ? "SUCCESS_ATOM" : 1;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.token = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.token = options.longs === String ? "0" : 0;
            object.backtrace = null;
            object.profile = null;
            object.errorType = options.enums === String ? "INTERNAL" : 1000000;
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.Response.ResponseType[message.type] : message.type;
        if (message.token != null && message.hasOwnProperty("token"))
            if (typeof message.token === "number")
                object.token = options.longs === String ? String(message.token) : message.token;
            else
                object.token = options.longs === String ? $util.Long.prototype.toString.call(message.token) : options.longs === Number ? new $util.LongBits(message.token.low >>> 0, message.token.high >>> 0).toNumber() : message.token;
        if (message.response && message.response.length) {
            object.response = [];
            for (var j = 0; j < message.response.length; ++j)
                object.response[j] = $root.Datum.toObject(message.response[j], options);
        }
        if (message.backtrace != null && message.hasOwnProperty("backtrace"))
            object.backtrace = $root.Backtrace.toObject(message.backtrace, options);
        if (message.profile != null && message.hasOwnProperty("profile"))
            object.profile = $root.Datum.toObject(message.profile, options);
        if (message.notes && message.notes.length) {
            object.notes = [];
            for (var j = 0; j < message.notes.length; ++j)
                object.notes[j] = options.enums === String ? $root.Response.ResponseNote[message.notes[j]] : message.notes[j];
        }
        if (message.errorType != null && message.hasOwnProperty("errorType"))
            object.errorType = options.enums === String ? $root.Response.ErrorType[message.errorType] : message.errorType;
        return object;
    };

    /**
     * Converts this Response to JSON.
     * @function toJSON
     * @memberof Response
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Response.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * ResponseType enum.
     * @name Response.ResponseType
     * @enum {string}
     * @property {number} SUCCESS_ATOM=1 SUCCESS_ATOM value
     * @property {number} SUCCESS_SEQUENCE=2 SUCCESS_SEQUENCE value
     * @property {number} SUCCESS_PARTIAL=3 SUCCESS_PARTIAL value
     * @property {number} WAIT_COMPLETE=4 WAIT_COMPLETE value
     * @property {number} SERVER_INFO=5 SERVER_INFO value
     * @property {number} CLIENT_ERROR=16 CLIENT_ERROR value
     * @property {number} COMPILE_ERROR=17 COMPILE_ERROR value
     * @property {number} RUNTIME_ERROR=18 RUNTIME_ERROR value
     */
    Response.ResponseType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "SUCCESS_ATOM"] = 1;
        values[valuesById[2] = "SUCCESS_SEQUENCE"] = 2;
        values[valuesById[3] = "SUCCESS_PARTIAL"] = 3;
        values[valuesById[4] = "WAIT_COMPLETE"] = 4;
        values[valuesById[5] = "SERVER_INFO"] = 5;
        values[valuesById[16] = "CLIENT_ERROR"] = 16;
        values[valuesById[17] = "COMPILE_ERROR"] = 17;
        values[valuesById[18] = "RUNTIME_ERROR"] = 18;
        return values;
    })();

    /**
     * ErrorType enum.
     * @name Response.ErrorType
     * @enum {string}
     * @property {number} INTERNAL=1000000 INTERNAL value
     * @property {number} RESOURCE_LIMIT=2000000 RESOURCE_LIMIT value
     * @property {number} QUERY_LOGIC=3000000 QUERY_LOGIC value
     * @property {number} NON_EXISTENCE=3100000 NON_EXISTENCE value
     * @property {number} OP_FAILED=4100000 OP_FAILED value
     * @property {number} OP_INDETERMINATE=4200000 OP_INDETERMINATE value
     * @property {number} USER=5000000 USER value
     * @property {number} PERMISSION_ERROR=6000000 PERMISSION_ERROR value
     */
    Response.ErrorType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1000000] = "INTERNAL"] = 1000000;
        values[valuesById[2000000] = "RESOURCE_LIMIT"] = 2000000;
        values[valuesById[3000000] = "QUERY_LOGIC"] = 3000000;
        values[valuesById[3100000] = "NON_EXISTENCE"] = 3100000;
        values[valuesById[4100000] = "OP_FAILED"] = 4100000;
        values[valuesById[4200000] = "OP_INDETERMINATE"] = 4200000;
        values[valuesById[5000000] = "USER"] = 5000000;
        values[valuesById[6000000] = "PERMISSION_ERROR"] = 6000000;
        return values;
    })();

    /**
     * ResponseNote enum.
     * @name Response.ResponseNote
     * @enum {string}
     * @property {number} SEQUENCE_FEED=1 SEQUENCE_FEED value
     * @property {number} ATOM_FEED=2 ATOM_FEED value
     * @property {number} ORDER_BY_LIMIT_FEED=3 ORDER_BY_LIMIT_FEED value
     * @property {number} UNIONED_FEED=4 UNIONED_FEED value
     * @property {number} INCLUDES_STATES=5 INCLUDES_STATES value
     */
    Response.ResponseNote = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "SEQUENCE_FEED"] = 1;
        values[valuesById[2] = "ATOM_FEED"] = 2;
        values[valuesById[3] = "ORDER_BY_LIMIT_FEED"] = 3;
        values[valuesById[4] = "UNIONED_FEED"] = 4;
        values[valuesById[5] = "INCLUDES_STATES"] = 5;
        return values;
    })();

    return Response;
})();

$root.Datum = (function() {

    /**
     * Properties of a Datum.
     * @exports IDatum
     * @interface IDatum
     * @property {Datum.DatumType|null} [type] Datum type
     * @property {boolean|null} [rBool] Datum rBool
     * @property {number|null} [rNum] Datum rNum
     * @property {string|null} [rStr] Datum rStr
     * @property {Array.<IDatum>|null} [rArray] Datum rArray
     * @property {Array.<Datum.IAssocPair>|null} [rObject] Datum rObject
     */

    /**
     * Constructs a new Datum.
     * @exports Datum
     * @classdesc Represents a Datum.
     * @implements IDatum
     * @constructor
     * @param {IDatum=} [properties] Properties to set
     */
    function Datum(properties) {
        this.rArray = [];
        this.rObject = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Datum type.
     * @member {Datum.DatumType} type
     * @memberof Datum
     * @instance
     */
    Datum.prototype.type = 1;

    /**
     * Datum rBool.
     * @member {boolean} rBool
     * @memberof Datum
     * @instance
     */
    Datum.prototype.rBool = false;

    /**
     * Datum rNum.
     * @member {number} rNum
     * @memberof Datum
     * @instance
     */
    Datum.prototype.rNum = 0;

    /**
     * Datum rStr.
     * @member {string} rStr
     * @memberof Datum
     * @instance
     */
    Datum.prototype.rStr = "";

    /**
     * Datum rArray.
     * @member {Array.<IDatum>} rArray
     * @memberof Datum
     * @instance
     */
    Datum.prototype.rArray = $util.emptyArray;

    /**
     * Datum rObject.
     * @member {Array.<Datum.IAssocPair>} rObject
     * @memberof Datum
     * @instance
     */
    Datum.prototype.rObject = $util.emptyArray;

    /**
     * Creates a new Datum instance using the specified properties.
     * @function create
     * @memberof Datum
     * @static
     * @param {IDatum=} [properties] Properties to set
     * @returns {Datum} Datum instance
     */
    Datum.create = function create(properties) {
        return new Datum(properties);
    };

    /**
     * Encodes the specified Datum message. Does not implicitly {@link Datum.verify|verify} messages.
     * @function encode
     * @memberof Datum
     * @static
     * @param {IDatum} message Datum message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Datum.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty("type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.rBool != null && message.hasOwnProperty("rBool"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.rBool);
        if (message.rNum != null && message.hasOwnProperty("rNum"))
            writer.uint32(/* id 3, wireType 1 =*/25).double(message.rNum);
        if (message.rStr != null && message.hasOwnProperty("rStr"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.rStr);
        if (message.rArray != null && message.rArray.length)
            for (var i = 0; i < message.rArray.length; ++i)
                $root.Datum.encode(message.rArray[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.rObject != null && message.rObject.length)
            for (var i = 0; i < message.rObject.length; ++i)
                $root.Datum.AssocPair.encode(message.rObject[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Datum message, length delimited. Does not implicitly {@link Datum.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Datum
     * @static
     * @param {IDatum} message Datum message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Datum.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Datum message from the specified reader or buffer.
     * @function decode
     * @memberof Datum
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Datum} Datum
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Datum.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Datum();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.type = reader.int32();
                break;
            case 2:
                message.rBool = reader.bool();
                break;
            case 3:
                message.rNum = reader.double();
                break;
            case 4:
                message.rStr = reader.string();
                break;
            case 5:
                if (!(message.rArray && message.rArray.length))
                    message.rArray = [];
                message.rArray.push($root.Datum.decode(reader, reader.uint32()));
                break;
            case 6:
                if (!(message.rObject && message.rObject.length))
                    message.rObject = [];
                message.rObject.push($root.Datum.AssocPair.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Datum message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Datum
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Datum} Datum
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Datum.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Datum message.
     * @function verify
     * @memberof Datum
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Datum.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            }
        if (message.rBool != null && message.hasOwnProperty("rBool"))
            if (typeof message.rBool !== "boolean")
                return "rBool: boolean expected";
        if (message.rNum != null && message.hasOwnProperty("rNum"))
            if (typeof message.rNum !== "number")
                return "rNum: number expected";
        if (message.rStr != null && message.hasOwnProperty("rStr"))
            if (!$util.isString(message.rStr))
                return "rStr: string expected";
        if (message.rArray != null && message.hasOwnProperty("rArray")) {
            if (!Array.isArray(message.rArray))
                return "rArray: array expected";
            for (var i = 0; i < message.rArray.length; ++i) {
                var error = $root.Datum.verify(message.rArray[i]);
                if (error)
                    return "rArray." + error;
            }
        }
        if (message.rObject != null && message.hasOwnProperty("rObject")) {
            if (!Array.isArray(message.rObject))
                return "rObject: array expected";
            for (var i = 0; i < message.rObject.length; ++i) {
                var error = $root.Datum.AssocPair.verify(message.rObject[i]);
                if (error)
                    return "rObject." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Datum message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Datum
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Datum} Datum
     */
    Datum.fromObject = function fromObject(object) {
        if (object instanceof $root.Datum)
            return object;
        var message = new $root.Datum();
        switch (object.type) {
        case "R_NULL":
        case 1:
            message.type = 1;
            break;
        case "R_BOOL":
        case 2:
            message.type = 2;
            break;
        case "R_NUM":
        case 3:
            message.type = 3;
            break;
        case "R_STR":
        case 4:
            message.type = 4;
            break;
        case "R_ARRAY":
        case 5:
            message.type = 5;
            break;
        case "R_OBJECT":
        case 6:
            message.type = 6;
            break;
        case "R_JSON":
        case 7:
            message.type = 7;
            break;
        }
        if (object.rBool != null)
            message.rBool = Boolean(object.rBool);
        if (object.rNum != null)
            message.rNum = Number(object.rNum);
        if (object.rStr != null)
            message.rStr = String(object.rStr);
        if (object.rArray) {
            if (!Array.isArray(object.rArray))
                throw TypeError(".Datum.rArray: array expected");
            message.rArray = [];
            for (var i = 0; i < object.rArray.length; ++i) {
                if (typeof object.rArray[i] !== "object")
                    throw TypeError(".Datum.rArray: object expected");
                message.rArray[i] = $root.Datum.fromObject(object.rArray[i]);
            }
        }
        if (object.rObject) {
            if (!Array.isArray(object.rObject))
                throw TypeError(".Datum.rObject: array expected");
            message.rObject = [];
            for (var i = 0; i < object.rObject.length; ++i) {
                if (typeof object.rObject[i] !== "object")
                    throw TypeError(".Datum.rObject: object expected");
                message.rObject[i] = $root.Datum.AssocPair.fromObject(object.rObject[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Datum message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Datum
     * @static
     * @param {Datum} message Datum
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Datum.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.rArray = [];
            object.rObject = [];
        }
        if (options.defaults) {
            object.type = options.enums === String ? "R_NULL" : 1;
            object.rBool = false;
            object.rNum = 0;
            object.rStr = "";
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.Datum.DatumType[message.type] : message.type;
        if (message.rBool != null && message.hasOwnProperty("rBool"))
            object.rBool = message.rBool;
        if (message.rNum != null && message.hasOwnProperty("rNum"))
            object.rNum = options.json && !isFinite(message.rNum) ? String(message.rNum) : message.rNum;
        if (message.rStr != null && message.hasOwnProperty("rStr"))
            object.rStr = message.rStr;
        if (message.rArray && message.rArray.length) {
            object.rArray = [];
            for (var j = 0; j < message.rArray.length; ++j)
                object.rArray[j] = $root.Datum.toObject(message.rArray[j], options);
        }
        if (message.rObject && message.rObject.length) {
            object.rObject = [];
            for (var j = 0; j < message.rObject.length; ++j)
                object.rObject[j] = $root.Datum.AssocPair.toObject(message.rObject[j], options);
        }
        return object;
    };

    /**
     * Converts this Datum to JSON.
     * @function toJSON
     * @memberof Datum
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Datum.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * DatumType enum.
     * @name Datum.DatumType
     * @enum {string}
     * @property {number} R_NULL=1 R_NULL value
     * @property {number} R_BOOL=2 R_BOOL value
     * @property {number} R_NUM=3 R_NUM value
     * @property {number} R_STR=4 R_STR value
     * @property {number} R_ARRAY=5 R_ARRAY value
     * @property {number} R_OBJECT=6 R_OBJECT value
     * @property {number} R_JSON=7 R_JSON value
     */
    Datum.DatumType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "R_NULL"] = 1;
        values[valuesById[2] = "R_BOOL"] = 2;
        values[valuesById[3] = "R_NUM"] = 3;
        values[valuesById[4] = "R_STR"] = 4;
        values[valuesById[5] = "R_ARRAY"] = 5;
        values[valuesById[6] = "R_OBJECT"] = 6;
        values[valuesById[7] = "R_JSON"] = 7;
        return values;
    })();

    Datum.AssocPair = (function() {

        /**
         * Properties of an AssocPair.
         * @memberof Datum
         * @interface IAssocPair
         * @property {string|null} [key] AssocPair key
         * @property {IDatum|null} [val] AssocPair val
         */

        /**
         * Constructs a new AssocPair.
         * @memberof Datum
         * @classdesc Represents an AssocPair.
         * @implements IAssocPair
         * @constructor
         * @param {Datum.IAssocPair=} [properties] Properties to set
         */
        function AssocPair(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AssocPair key.
         * @member {string} key
         * @memberof Datum.AssocPair
         * @instance
         */
        AssocPair.prototype.key = "";

        /**
         * AssocPair val.
         * @member {IDatum|null|undefined} val
         * @memberof Datum.AssocPair
         * @instance
         */
        AssocPair.prototype.val = null;

        /**
         * Creates a new AssocPair instance using the specified properties.
         * @function create
         * @memberof Datum.AssocPair
         * @static
         * @param {Datum.IAssocPair=} [properties] Properties to set
         * @returns {Datum.AssocPair} AssocPair instance
         */
        AssocPair.create = function create(properties) {
            return new AssocPair(properties);
        };

        /**
         * Encodes the specified AssocPair message. Does not implicitly {@link Datum.AssocPair.verify|verify} messages.
         * @function encode
         * @memberof Datum.AssocPair
         * @static
         * @param {Datum.IAssocPair} message AssocPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssocPair.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && message.hasOwnProperty("key"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
            if (message.val != null && message.hasOwnProperty("val"))
                $root.Datum.encode(message.val, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AssocPair message, length delimited. Does not implicitly {@link Datum.AssocPair.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Datum.AssocPair
         * @static
         * @param {Datum.IAssocPair} message AssocPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssocPair.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AssocPair message from the specified reader or buffer.
         * @function decode
         * @memberof Datum.AssocPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Datum.AssocPair} AssocPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssocPair.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Datum.AssocPair();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.val = $root.Datum.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AssocPair message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Datum.AssocPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Datum.AssocPair} AssocPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssocPair.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AssocPair message.
         * @function verify
         * @memberof Datum.AssocPair
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AssocPair.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!$util.isString(message.key))
                    return "key: string expected";
            if (message.val != null && message.hasOwnProperty("val")) {
                var error = $root.Datum.verify(message.val);
                if (error)
                    return "val." + error;
            }
            return null;
        };

        /**
         * Creates an AssocPair message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Datum.AssocPair
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Datum.AssocPair} AssocPair
         */
        AssocPair.fromObject = function fromObject(object) {
            if (object instanceof $root.Datum.AssocPair)
                return object;
            var message = new $root.Datum.AssocPair();
            if (object.key != null)
                message.key = String(object.key);
            if (object.val != null) {
                if (typeof object.val !== "object")
                    throw TypeError(".Datum.AssocPair.val: object expected");
                message.val = $root.Datum.fromObject(object.val);
            }
            return message;
        };

        /**
         * Creates a plain object from an AssocPair message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Datum.AssocPair
         * @static
         * @param {Datum.AssocPair} message AssocPair
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AssocPair.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.key = "";
                object.val = null;
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.val != null && message.hasOwnProperty("val"))
                object.val = $root.Datum.toObject(message.val, options);
            return object;
        };

        /**
         * Converts this AssocPair to JSON.
         * @function toJSON
         * @memberof Datum.AssocPair
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AssocPair.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AssocPair;
    })();

    return Datum;
})();

$root.Term = (function() {

    /**
     * Properties of a Term.
     * @exports ITerm
     * @interface ITerm
     * @property {Term.TermType|null} [type] Term type
     * @property {IDatum|null} [datum] Term datum
     * @property {Array.<ITerm>|null} [args] Term args
     * @property {Array.<Term.IAssocPair>|null} [optargs] Term optargs
     */

    /**
     * Constructs a new Term.
     * @exports Term
     * @classdesc Represents a Term.
     * @implements ITerm
     * @constructor
     * @param {ITerm=} [properties] Properties to set
     */
    function Term(properties) {
        this.args = [];
        this.optargs = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Term type.
     * @member {Term.TermType} type
     * @memberof Term
     * @instance
     */
    Term.prototype.type = 1;

    /**
     * Term datum.
     * @member {IDatum|null|undefined} datum
     * @memberof Term
     * @instance
     */
    Term.prototype.datum = null;

    /**
     * Term args.
     * @member {Array.<ITerm>} args
     * @memberof Term
     * @instance
     */
    Term.prototype.args = $util.emptyArray;

    /**
     * Term optargs.
     * @member {Array.<Term.IAssocPair>} optargs
     * @memberof Term
     * @instance
     */
    Term.prototype.optargs = $util.emptyArray;

    /**
     * Creates a new Term instance using the specified properties.
     * @function create
     * @memberof Term
     * @static
     * @param {ITerm=} [properties] Properties to set
     * @returns {Term} Term instance
     */
    Term.create = function create(properties) {
        return new Term(properties);
    };

    /**
     * Encodes the specified Term message. Does not implicitly {@link Term.verify|verify} messages.
     * @function encode
     * @memberof Term
     * @static
     * @param {ITerm} message Term message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Term.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.type != null && message.hasOwnProperty("type"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
        if (message.datum != null && message.hasOwnProperty("datum"))
            $root.Datum.encode(message.datum, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.args != null && message.args.length)
            for (var i = 0; i < message.args.length; ++i)
                $root.Term.encode(message.args[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.optargs != null && message.optargs.length)
            for (var i = 0; i < message.optargs.length; ++i)
                $root.Term.AssocPair.encode(message.optargs[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Term message, length delimited. Does not implicitly {@link Term.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Term
     * @static
     * @param {ITerm} message Term message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Term.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Term message from the specified reader or buffer.
     * @function decode
     * @memberof Term
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Term} Term
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Term.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Term();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.type = reader.int32();
                break;
            case 2:
                message.datum = $root.Datum.decode(reader, reader.uint32());
                break;
            case 3:
                if (!(message.args && message.args.length))
                    message.args = [];
                message.args.push($root.Term.decode(reader, reader.uint32()));
                break;
            case 4:
                if (!(message.optargs && message.optargs.length))
                    message.optargs = [];
                message.optargs.push($root.Term.AssocPair.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Term message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Term
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Term} Term
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Term.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Term message.
     * @function verify
     * @memberof Term
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Term.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.type != null && message.hasOwnProperty("type"))
            switch (message.type) {
            default:
                return "type: enum value expected";
            case 1:
            case 2:
            case 3:
            case 10:
            case 11:
            case 169:
            case 153:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 78:
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23:
            case 24:
            case 25:
            case 26:
            case 27:
            case 28:
            case 183:
            case 184:
            case 185:
            case 29:
            case 80:
            case 95:
            case 88:
            case 89:
            case 90:
            case 91:
            case 30:
            case 70:
            case 71:
            case 87:
            case 93:
            case 31:
            case 94:
            case 186:
            case 143:
            case 32:
            case 96:
            case 33:
            case 34:
            case 35:
            case 36:
            case 182:
            case 37:
            case 38:
            case 187:
            case 39:
            case 40:
            case 41:
            case 42:
            case 43:
            case 86:
            case 44:
            case 45:
            case 170:
            case 48:
            case 49:
            case 50:
            case 72:
            case 173:
            case 82:
            case 83:
            case 84:
            case 85:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
            case 58:
            case 59:
            case 60:
            case 61:
            case 62:
            case 174:
            case 175:
            case 177:
            case 176:
            case 179:
            case 138:
            case 188:
            case 75:
            case 76:
            case 77:
            case 139:
            case 140:
            case 156:
            case 189:
            case 190:
            case 64:
            case 65:
            case 66:
            case 67:
            case 68:
            case 69:
            case 73:
            case 74:
            case 79:
            case 97:
            case 141:
            case 142:
            case 81:
            case 92:
            case 98:
            case 99:
            case 100:
            case 101:
            case 102:
            case 103:
            case 104:
            case 105:
            case 106:
            case 126:
            case 127:
            case 128:
            case 129:
            case 130:
            case 131:
            case 132:
            case 133:
            case 134:
            case 135:
            case 136:
            case 107:
            case 108:
            case 109:
            case 110:
            case 111:
            case 112:
            case 113:
            case 114:
            case 115:
            case 116:
            case 117:
            case 118:
            case 119:
            case 120:
            case 121:
            case 122:
            case 123:
            case 124:
            case 125:
            case 137:
            case 144:
            case 145:
            case 146:
            case 147:
            case 148:
            case 149:
            case 150:
            case 151:
            case 152:
            case 154:
            case 155:
            case 157:
            case 158:
            case 159:
            case 160:
            case 161:
            case 162:
            case 163:
            case 164:
            case 165:
            case 166:
            case 167:
            case 168:
            case 171:
            case 172:
            case 180:
            case 181:
            case 191:
            case 192:
            case 193:
            case 194:
            case 195:
            case 196:
                break;
            }
        if (message.datum != null && message.hasOwnProperty("datum")) {
            var error = $root.Datum.verify(message.datum);
            if (error)
                return "datum." + error;
        }
        if (message.args != null && message.hasOwnProperty("args")) {
            if (!Array.isArray(message.args))
                return "args: array expected";
            for (var i = 0; i < message.args.length; ++i) {
                var error = $root.Term.verify(message.args[i]);
                if (error)
                    return "args." + error;
            }
        }
        if (message.optargs != null && message.hasOwnProperty("optargs")) {
            if (!Array.isArray(message.optargs))
                return "optargs: array expected";
            for (var i = 0; i < message.optargs.length; ++i) {
                var error = $root.Term.AssocPair.verify(message.optargs[i]);
                if (error)
                    return "optargs." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Term message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Term
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Term} Term
     */
    Term.fromObject = function fromObject(object) {
        if (object instanceof $root.Term)
            return object;
        var message = new $root.Term();
        switch (object.type) {
        case "DATUM":
        case 1:
            message.type = 1;
            break;
        case "MAKE_ARRAY":
        case 2:
            message.type = 2;
            break;
        case "MAKE_OBJ":
        case 3:
            message.type = 3;
            break;
        case "VAR":
        case 10:
            message.type = 10;
            break;
        case "JAVASCRIPT":
        case 11:
            message.type = 11;
            break;
        case "UUID":
        case 169:
            message.type = 169;
            break;
        case "HTTP":
        case 153:
            message.type = 153;
            break;
        case "ERROR":
        case 12:
            message.type = 12;
            break;
        case "IMPLICIT_VAR":
        case 13:
            message.type = 13;
            break;
        case "DB":
        case 14:
            message.type = 14;
            break;
        case "TABLE":
        case 15:
            message.type = 15;
            break;
        case "GET":
        case 16:
            message.type = 16;
            break;
        case "GET_ALL":
        case 78:
            message.type = 78;
            break;
        case "EQ":
        case 17:
            message.type = 17;
            break;
        case "NE":
        case 18:
            message.type = 18;
            break;
        case "LT":
        case 19:
            message.type = 19;
            break;
        case "LE":
        case 20:
            message.type = 20;
            break;
        case "GT":
        case 21:
            message.type = 21;
            break;
        case "GE":
        case 22:
            message.type = 22;
            break;
        case "NOT":
        case 23:
            message.type = 23;
            break;
        case "ADD":
        case 24:
            message.type = 24;
            break;
        case "SUB":
        case 25:
            message.type = 25;
            break;
        case "MUL":
        case 26:
            message.type = 26;
            break;
        case "DIV":
        case 27:
            message.type = 27;
            break;
        case "MOD":
        case 28:
            message.type = 28;
            break;
        case "FLOOR":
        case 183:
            message.type = 183;
            break;
        case "CEIL":
        case 184:
            message.type = 184;
            break;
        case "ROUND":
        case 185:
            message.type = 185;
            break;
        case "APPEND":
        case 29:
            message.type = 29;
            break;
        case "PREPEND":
        case 80:
            message.type = 80;
            break;
        case "DIFFERENCE":
        case 95:
            message.type = 95;
            break;
        case "SET_INSERT":
        case 88:
            message.type = 88;
            break;
        case "SET_INTERSECTION":
        case 89:
            message.type = 89;
            break;
        case "SET_UNION":
        case 90:
            message.type = 90;
            break;
        case "SET_DIFFERENCE":
        case 91:
            message.type = 91;
            break;
        case "SLICE":
        case 30:
            message.type = 30;
            break;
        case "SKIP":
        case 70:
            message.type = 70;
            break;
        case "LIMIT":
        case 71:
            message.type = 71;
            break;
        case "OFFSETS_OF":
        case 87:
            message.type = 87;
            break;
        case "CONTAINS":
        case 93:
            message.type = 93;
            break;
        case "GET_FIELD":
        case 31:
            message.type = 31;
            break;
        case "KEYS":
        case 94:
            message.type = 94;
            break;
        case "VALUES":
        case 186:
            message.type = 186;
            break;
        case "OBJECT":
        case 143:
            message.type = 143;
            break;
        case "HAS_FIELDS":
        case 32:
            message.type = 32;
            break;
        case "WITH_FIELDS":
        case 96:
            message.type = 96;
            break;
        case "PLUCK":
        case 33:
            message.type = 33;
            break;
        case "WITHOUT":
        case 34:
            message.type = 34;
            break;
        case "MERGE":
        case 35:
            message.type = 35;
            break;
        case "BETWEEN_DEPRECATED":
        case 36:
            message.type = 36;
            break;
        case "BETWEEN":
        case 182:
            message.type = 182;
            break;
        case "REDUCE":
        case 37:
            message.type = 37;
            break;
        case "MAP":
        case 38:
            message.type = 38;
            break;
        case "FOLD":
        case 187:
            message.type = 187;
            break;
        case "FILTER":
        case 39:
            message.type = 39;
            break;
        case "CONCAT_MAP":
        case 40:
            message.type = 40;
            break;
        case "ORDER_BY":
        case 41:
            message.type = 41;
            break;
        case "DISTINCT":
        case 42:
            message.type = 42;
            break;
        case "COUNT":
        case 43:
            message.type = 43;
            break;
        case "IS_EMPTY":
        case 86:
            message.type = 86;
            break;
        case "UNION":
        case 44:
            message.type = 44;
            break;
        case "NTH":
        case 45:
            message.type = 45;
            break;
        case "BRACKET":
        case 170:
            message.type = 170;
            break;
        case "INNER_JOIN":
        case 48:
            message.type = 48;
            break;
        case "OUTER_JOIN":
        case 49:
            message.type = 49;
            break;
        case "EQ_JOIN":
        case 50:
            message.type = 50;
            break;
        case "ZIP":
        case 72:
            message.type = 72;
            break;
        case "RANGE":
        case 173:
            message.type = 173;
            break;
        case "INSERT_AT":
        case 82:
            message.type = 82;
            break;
        case "DELETE_AT":
        case 83:
            message.type = 83;
            break;
        case "CHANGE_AT":
        case 84:
            message.type = 84;
            break;
        case "SPLICE_AT":
        case 85:
            message.type = 85;
            break;
        case "COERCE_TO":
        case 51:
            message.type = 51;
            break;
        case "TYPE_OF":
        case 52:
            message.type = 52;
            break;
        case "UPDATE":
        case 53:
            message.type = 53;
            break;
        case "DELETE":
        case 54:
            message.type = 54;
            break;
        case "REPLACE":
        case 55:
            message.type = 55;
            break;
        case "INSERT":
        case 56:
            message.type = 56;
            break;
        case "DB_CREATE":
        case 57:
            message.type = 57;
            break;
        case "DB_DROP":
        case 58:
            message.type = 58;
            break;
        case "DB_LIST":
        case 59:
            message.type = 59;
            break;
        case "TABLE_CREATE":
        case 60:
            message.type = 60;
            break;
        case "TABLE_DROP":
        case 61:
            message.type = 61;
            break;
        case "TABLE_LIST":
        case 62:
            message.type = 62;
            break;
        case "CONFIG":
        case 174:
            message.type = 174;
            break;
        case "STATUS":
        case 175:
            message.type = 175;
            break;
        case "WAIT":
        case 177:
            message.type = 177;
            break;
        case "RECONFIGURE":
        case 176:
            message.type = 176;
            break;
        case "REBALANCE":
        case 179:
            message.type = 179;
            break;
        case "SYNC":
        case 138:
            message.type = 138;
            break;
        case "GRANT":
        case 188:
            message.type = 188;
            break;
        case "INDEX_CREATE":
        case 75:
            message.type = 75;
            break;
        case "INDEX_DROP":
        case 76:
            message.type = 76;
            break;
        case "INDEX_LIST":
        case 77:
            message.type = 77;
            break;
        case "INDEX_STATUS":
        case 139:
            message.type = 139;
            break;
        case "INDEX_WAIT":
        case 140:
            message.type = 140;
            break;
        case "INDEX_RENAME":
        case 156:
            message.type = 156;
            break;
        case "SET_WRITE_HOOK":
        case 189:
            message.type = 189;
            break;
        case "GET_WRITE_HOOK":
        case 190:
            message.type = 190;
            break;
        case "FUNCALL":
        case 64:
            message.type = 64;
            break;
        case "BRANCH":
        case 65:
            message.type = 65;
            break;
        case "OR":
        case 66:
            message.type = 66;
            break;
        case "AND":
        case 67:
            message.type = 67;
            break;
        case "FOR_EACH":
        case 68:
            message.type = 68;
            break;
        case "FUNC":
        case 69:
            message.type = 69;
            break;
        case "ASC":
        case 73:
            message.type = 73;
            break;
        case "DESC":
        case 74:
            message.type = 74;
            break;
        case "INFO":
        case 79:
            message.type = 79;
            break;
        case "MATCH":
        case 97:
            message.type = 97;
            break;
        case "UPCASE":
        case 141:
            message.type = 141;
            break;
        case "DOWNCASE":
        case 142:
            message.type = 142;
            break;
        case "SAMPLE":
        case 81:
            message.type = 81;
            break;
        case "DEFAULT":
        case 92:
            message.type = 92;
            break;
        case "JSON":
        case 98:
            message.type = 98;
            break;
        case "ISO8601":
        case 99:
            message.type = 99;
            break;
        case "TO_ISO8601":
        case 100:
            message.type = 100;
            break;
        case "EPOCH_TIME":
        case 101:
            message.type = 101;
            break;
        case "TO_EPOCH_TIME":
        case 102:
            message.type = 102;
            break;
        case "NOW":
        case 103:
            message.type = 103;
            break;
        case "IN_TIMEZONE":
        case 104:
            message.type = 104;
            break;
        case "DURING":
        case 105:
            message.type = 105;
            break;
        case "DATE":
        case 106:
            message.type = 106;
            break;
        case "TIME_OF_DAY":
        case 126:
            message.type = 126;
            break;
        case "TIMEZONE":
        case 127:
            message.type = 127;
            break;
        case "YEAR":
        case 128:
            message.type = 128;
            break;
        case "MONTH":
        case 129:
            message.type = 129;
            break;
        case "DAY":
        case 130:
            message.type = 130;
            break;
        case "DAY_OF_WEEK":
        case 131:
            message.type = 131;
            break;
        case "DAY_OF_YEAR":
        case 132:
            message.type = 132;
            break;
        case "HOURS":
        case 133:
            message.type = 133;
            break;
        case "MINUTES":
        case 134:
            message.type = 134;
            break;
        case "SECONDS":
        case 135:
            message.type = 135;
            break;
        case "TIME":
        case 136:
            message.type = 136;
            break;
        case "MONDAY":
        case 107:
            message.type = 107;
            break;
        case "TUESDAY":
        case 108:
            message.type = 108;
            break;
        case "WEDNESDAY":
        case 109:
            message.type = 109;
            break;
        case "THURSDAY":
        case 110:
            message.type = 110;
            break;
        case "FRIDAY":
        case 111:
            message.type = 111;
            break;
        case "SATURDAY":
        case 112:
            message.type = 112;
            break;
        case "SUNDAY":
        case 113:
            message.type = 113;
            break;
        case "JANUARY":
        case 114:
            message.type = 114;
            break;
        case "FEBRUARY":
        case 115:
            message.type = 115;
            break;
        case "MARCH":
        case 116:
            message.type = 116;
            break;
        case "APRIL":
        case 117:
            message.type = 117;
            break;
        case "MAY":
        case 118:
            message.type = 118;
            break;
        case "JUNE":
        case 119:
            message.type = 119;
            break;
        case "JULY":
        case 120:
            message.type = 120;
            break;
        case "AUGUST":
        case 121:
            message.type = 121;
            break;
        case "SEPTEMBER":
        case 122:
            message.type = 122;
            break;
        case "OCTOBER":
        case 123:
            message.type = 123;
            break;
        case "NOVEMBER":
        case 124:
            message.type = 124;
            break;
        case "DECEMBER":
        case 125:
            message.type = 125;
            break;
        case "LITERAL":
        case 137:
            message.type = 137;
            break;
        case "GROUP":
        case 144:
            message.type = 144;
            break;
        case "SUM":
        case 145:
            message.type = 145;
            break;
        case "AVG":
        case 146:
            message.type = 146;
            break;
        case "MIN":
        case 147:
            message.type = 147;
            break;
        case "MAX":
        case 148:
            message.type = 148;
            break;
        case "SPLIT":
        case 149:
            message.type = 149;
            break;
        case "UNGROUP":
        case 150:
            message.type = 150;
            break;
        case "RANDOM":
        case 151:
            message.type = 151;
            break;
        case "CHANGES":
        case 152:
            message.type = 152;
            break;
        case "ARGS":
        case 154:
            message.type = 154;
            break;
        case "BINARY":
        case 155:
            message.type = 155;
            break;
        case "GEOJSON":
        case 157:
            message.type = 157;
            break;
        case "TO_GEOJSON":
        case 158:
            message.type = 158;
            break;
        case "POINT":
        case 159:
            message.type = 159;
            break;
        case "LINE":
        case 160:
            message.type = 160;
            break;
        case "POLYGON":
        case 161:
            message.type = 161;
            break;
        case "DISTANCE":
        case 162:
            message.type = 162;
            break;
        case "INTERSECTS":
        case 163:
            message.type = 163;
            break;
        case "INCLUDES":
        case 164:
            message.type = 164;
            break;
        case "CIRCLE":
        case 165:
            message.type = 165;
            break;
        case "GET_INTERSECTING":
        case 166:
            message.type = 166;
            break;
        case "FILL":
        case 167:
            message.type = 167;
            break;
        case "GET_NEAREST":
        case 168:
            message.type = 168;
            break;
        case "POLYGON_SUB":
        case 171:
            message.type = 171;
            break;
        case "TO_JSON_STRING":
        case 172:
            message.type = 172;
            break;
        case "MINVAL":
        case 180:
            message.type = 180;
            break;
        case "MAXVAL":
        case 181:
            message.type = 181;
            break;
        case "BIT_AND":
        case 191:
            message.type = 191;
            break;
        case "BIT_OR":
        case 192:
            message.type = 192;
            break;
        case "BIT_XOR":
        case 193:
            message.type = 193;
            break;
        case "BIT_NOT":
        case 194:
            message.type = 194;
            break;
        case "BIT_SAL":
        case 195:
            message.type = 195;
            break;
        case "BIT_SAR":
        case 196:
            message.type = 196;
            break;
        }
        if (object.datum != null) {
            if (typeof object.datum !== "object")
                throw TypeError(".Term.datum: object expected");
            message.datum = $root.Datum.fromObject(object.datum);
        }
        if (object.args) {
            if (!Array.isArray(object.args))
                throw TypeError(".Term.args: array expected");
            message.args = [];
            for (var i = 0; i < object.args.length; ++i) {
                if (typeof object.args[i] !== "object")
                    throw TypeError(".Term.args: object expected");
                message.args[i] = $root.Term.fromObject(object.args[i]);
            }
        }
        if (object.optargs) {
            if (!Array.isArray(object.optargs))
                throw TypeError(".Term.optargs: array expected");
            message.optargs = [];
            for (var i = 0; i < object.optargs.length; ++i) {
                if (typeof object.optargs[i] !== "object")
                    throw TypeError(".Term.optargs: object expected");
                message.optargs[i] = $root.Term.AssocPair.fromObject(object.optargs[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Term message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Term
     * @static
     * @param {Term} message Term
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Term.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.args = [];
            object.optargs = [];
        }
        if (options.defaults) {
            object.type = options.enums === String ? "DATUM" : 1;
            object.datum = null;
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = options.enums === String ? $root.Term.TermType[message.type] : message.type;
        if (message.datum != null && message.hasOwnProperty("datum"))
            object.datum = $root.Datum.toObject(message.datum, options);
        if (message.args && message.args.length) {
            object.args = [];
            for (var j = 0; j < message.args.length; ++j)
                object.args[j] = $root.Term.toObject(message.args[j], options);
        }
        if (message.optargs && message.optargs.length) {
            object.optargs = [];
            for (var j = 0; j < message.optargs.length; ++j)
                object.optargs[j] = $root.Term.AssocPair.toObject(message.optargs[j], options);
        }
        return object;
    };

    /**
     * Converts this Term to JSON.
     * @function toJSON
     * @memberof Term
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Term.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * TermType enum.
     * @name Term.TermType
     * @enum {string}
     * @property {number} DATUM=1 DATUM value
     * @property {number} MAKE_ARRAY=2 MAKE_ARRAY value
     * @property {number} MAKE_OBJ=3 MAKE_OBJ value
     * @property {number} VAR=10 VAR value
     * @property {number} JAVASCRIPT=11 JAVASCRIPT value
     * @property {number} UUID=169 UUID value
     * @property {number} HTTP=153 HTTP value
     * @property {number} ERROR=12 ERROR value
     * @property {number} IMPLICIT_VAR=13 IMPLICIT_VAR value
     * @property {number} DB=14 DB value
     * @property {number} TABLE=15 TABLE value
     * @property {number} GET=16 GET value
     * @property {number} GET_ALL=78 GET_ALL value
     * @property {number} EQ=17 EQ value
     * @property {number} NE=18 NE value
     * @property {number} LT=19 LT value
     * @property {number} LE=20 LE value
     * @property {number} GT=21 GT value
     * @property {number} GE=22 GE value
     * @property {number} NOT=23 NOT value
     * @property {number} ADD=24 ADD value
     * @property {number} SUB=25 SUB value
     * @property {number} MUL=26 MUL value
     * @property {number} DIV=27 DIV value
     * @property {number} MOD=28 MOD value
     * @property {number} FLOOR=183 FLOOR value
     * @property {number} CEIL=184 CEIL value
     * @property {number} ROUND=185 ROUND value
     * @property {number} APPEND=29 APPEND value
     * @property {number} PREPEND=80 PREPEND value
     * @property {number} DIFFERENCE=95 DIFFERENCE value
     * @property {number} SET_INSERT=88 SET_INSERT value
     * @property {number} SET_INTERSECTION=89 SET_INTERSECTION value
     * @property {number} SET_UNION=90 SET_UNION value
     * @property {number} SET_DIFFERENCE=91 SET_DIFFERENCE value
     * @property {number} SLICE=30 SLICE value
     * @property {number} SKIP=70 SKIP value
     * @property {number} LIMIT=71 LIMIT value
     * @property {number} OFFSETS_OF=87 OFFSETS_OF value
     * @property {number} CONTAINS=93 CONTAINS value
     * @property {number} GET_FIELD=31 GET_FIELD value
     * @property {number} KEYS=94 KEYS value
     * @property {number} VALUES=186 VALUES value
     * @property {number} OBJECT=143 OBJECT value
     * @property {number} HAS_FIELDS=32 HAS_FIELDS value
     * @property {number} WITH_FIELDS=96 WITH_FIELDS value
     * @property {number} PLUCK=33 PLUCK value
     * @property {number} WITHOUT=34 WITHOUT value
     * @property {number} MERGE=35 MERGE value
     * @property {number} BETWEEN_DEPRECATED=36 BETWEEN_DEPRECATED value
     * @property {number} BETWEEN=182 BETWEEN value
     * @property {number} REDUCE=37 REDUCE value
     * @property {number} MAP=38 MAP value
     * @property {number} FOLD=187 FOLD value
     * @property {number} FILTER=39 FILTER value
     * @property {number} CONCAT_MAP=40 CONCAT_MAP value
     * @property {number} ORDER_BY=41 ORDER_BY value
     * @property {number} DISTINCT=42 DISTINCT value
     * @property {number} COUNT=43 COUNT value
     * @property {number} IS_EMPTY=86 IS_EMPTY value
     * @property {number} UNION=44 UNION value
     * @property {number} NTH=45 NTH value
     * @property {number} BRACKET=170 BRACKET value
     * @property {number} INNER_JOIN=48 INNER_JOIN value
     * @property {number} OUTER_JOIN=49 OUTER_JOIN value
     * @property {number} EQ_JOIN=50 EQ_JOIN value
     * @property {number} ZIP=72 ZIP value
     * @property {number} RANGE=173 RANGE value
     * @property {number} INSERT_AT=82 INSERT_AT value
     * @property {number} DELETE_AT=83 DELETE_AT value
     * @property {number} CHANGE_AT=84 CHANGE_AT value
     * @property {number} SPLICE_AT=85 SPLICE_AT value
     * @property {number} COERCE_TO=51 COERCE_TO value
     * @property {number} TYPE_OF=52 TYPE_OF value
     * @property {number} UPDATE=53 UPDATE value
     * @property {number} DELETE=54 DELETE value
     * @property {number} REPLACE=55 REPLACE value
     * @property {number} INSERT=56 INSERT value
     * @property {number} DB_CREATE=57 DB_CREATE value
     * @property {number} DB_DROP=58 DB_DROP value
     * @property {number} DB_LIST=59 DB_LIST value
     * @property {number} TABLE_CREATE=60 TABLE_CREATE value
     * @property {number} TABLE_DROP=61 TABLE_DROP value
     * @property {number} TABLE_LIST=62 TABLE_LIST value
     * @property {number} CONFIG=174 CONFIG value
     * @property {number} STATUS=175 STATUS value
     * @property {number} WAIT=177 WAIT value
     * @property {number} RECONFIGURE=176 RECONFIGURE value
     * @property {number} REBALANCE=179 REBALANCE value
     * @property {number} SYNC=138 SYNC value
     * @property {number} GRANT=188 GRANT value
     * @property {number} INDEX_CREATE=75 INDEX_CREATE value
     * @property {number} INDEX_DROP=76 INDEX_DROP value
     * @property {number} INDEX_LIST=77 INDEX_LIST value
     * @property {number} INDEX_STATUS=139 INDEX_STATUS value
     * @property {number} INDEX_WAIT=140 INDEX_WAIT value
     * @property {number} INDEX_RENAME=156 INDEX_RENAME value
     * @property {number} SET_WRITE_HOOK=189 SET_WRITE_HOOK value
     * @property {number} GET_WRITE_HOOK=190 GET_WRITE_HOOK value
     * @property {number} FUNCALL=64 FUNCALL value
     * @property {number} BRANCH=65 BRANCH value
     * @property {number} OR=66 OR value
     * @property {number} AND=67 AND value
     * @property {number} FOR_EACH=68 FOR_EACH value
     * @property {number} FUNC=69 FUNC value
     * @property {number} ASC=73 ASC value
     * @property {number} DESC=74 DESC value
     * @property {number} INFO=79 INFO value
     * @property {number} MATCH=97 MATCH value
     * @property {number} UPCASE=141 UPCASE value
     * @property {number} DOWNCASE=142 DOWNCASE value
     * @property {number} SAMPLE=81 SAMPLE value
     * @property {number} DEFAULT=92 DEFAULT value
     * @property {number} JSON=98 JSON value
     * @property {number} ISO8601=99 ISO8601 value
     * @property {number} TO_ISO8601=100 TO_ISO8601 value
     * @property {number} EPOCH_TIME=101 EPOCH_TIME value
     * @property {number} TO_EPOCH_TIME=102 TO_EPOCH_TIME value
     * @property {number} NOW=103 NOW value
     * @property {number} IN_TIMEZONE=104 IN_TIMEZONE value
     * @property {number} DURING=105 DURING value
     * @property {number} DATE=106 DATE value
     * @property {number} TIME_OF_DAY=126 TIME_OF_DAY value
     * @property {number} TIMEZONE=127 TIMEZONE value
     * @property {number} YEAR=128 YEAR value
     * @property {number} MONTH=129 MONTH value
     * @property {number} DAY=130 DAY value
     * @property {number} DAY_OF_WEEK=131 DAY_OF_WEEK value
     * @property {number} DAY_OF_YEAR=132 DAY_OF_YEAR value
     * @property {number} HOURS=133 HOURS value
     * @property {number} MINUTES=134 MINUTES value
     * @property {number} SECONDS=135 SECONDS value
     * @property {number} TIME=136 TIME value
     * @property {number} MONDAY=107 MONDAY value
     * @property {number} TUESDAY=108 TUESDAY value
     * @property {number} WEDNESDAY=109 WEDNESDAY value
     * @property {number} THURSDAY=110 THURSDAY value
     * @property {number} FRIDAY=111 FRIDAY value
     * @property {number} SATURDAY=112 SATURDAY value
     * @property {number} SUNDAY=113 SUNDAY value
     * @property {number} JANUARY=114 JANUARY value
     * @property {number} FEBRUARY=115 FEBRUARY value
     * @property {number} MARCH=116 MARCH value
     * @property {number} APRIL=117 APRIL value
     * @property {number} MAY=118 MAY value
     * @property {number} JUNE=119 JUNE value
     * @property {number} JULY=120 JULY value
     * @property {number} AUGUST=121 AUGUST value
     * @property {number} SEPTEMBER=122 SEPTEMBER value
     * @property {number} OCTOBER=123 OCTOBER value
     * @property {number} NOVEMBER=124 NOVEMBER value
     * @property {number} DECEMBER=125 DECEMBER value
     * @property {number} LITERAL=137 LITERAL value
     * @property {number} GROUP=144 GROUP value
     * @property {number} SUM=145 SUM value
     * @property {number} AVG=146 AVG value
     * @property {number} MIN=147 MIN value
     * @property {number} MAX=148 MAX value
     * @property {number} SPLIT=149 SPLIT value
     * @property {number} UNGROUP=150 UNGROUP value
     * @property {number} RANDOM=151 RANDOM value
     * @property {number} CHANGES=152 CHANGES value
     * @property {number} ARGS=154 ARGS value
     * @property {number} BINARY=155 BINARY value
     * @property {number} GEOJSON=157 GEOJSON value
     * @property {number} TO_GEOJSON=158 TO_GEOJSON value
     * @property {number} POINT=159 POINT value
     * @property {number} LINE=160 LINE value
     * @property {number} POLYGON=161 POLYGON value
     * @property {number} DISTANCE=162 DISTANCE value
     * @property {number} INTERSECTS=163 INTERSECTS value
     * @property {number} INCLUDES=164 INCLUDES value
     * @property {number} CIRCLE=165 CIRCLE value
     * @property {number} GET_INTERSECTING=166 GET_INTERSECTING value
     * @property {number} FILL=167 FILL value
     * @property {number} GET_NEAREST=168 GET_NEAREST value
     * @property {number} POLYGON_SUB=171 POLYGON_SUB value
     * @property {number} TO_JSON_STRING=172 TO_JSON_STRING value
     * @property {number} MINVAL=180 MINVAL value
     * @property {number} MAXVAL=181 MAXVAL value
     * @property {number} BIT_AND=191 BIT_AND value
     * @property {number} BIT_OR=192 BIT_OR value
     * @property {number} BIT_XOR=193 BIT_XOR value
     * @property {number} BIT_NOT=194 BIT_NOT value
     * @property {number} BIT_SAL=195 BIT_SAL value
     * @property {number} BIT_SAR=196 BIT_SAR value
     */
    Term.TermType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "DATUM"] = 1;
        values[valuesById[2] = "MAKE_ARRAY"] = 2;
        values[valuesById[3] = "MAKE_OBJ"] = 3;
        values[valuesById[10] = "VAR"] = 10;
        values[valuesById[11] = "JAVASCRIPT"] = 11;
        values[valuesById[169] = "UUID"] = 169;
        values[valuesById[153] = "HTTP"] = 153;
        values[valuesById[12] = "ERROR"] = 12;
        values[valuesById[13] = "IMPLICIT_VAR"] = 13;
        values[valuesById[14] = "DB"] = 14;
        values[valuesById[15] = "TABLE"] = 15;
        values[valuesById[16] = "GET"] = 16;
        values[valuesById[78] = "GET_ALL"] = 78;
        values[valuesById[17] = "EQ"] = 17;
        values[valuesById[18] = "NE"] = 18;
        values[valuesById[19] = "LT"] = 19;
        values[valuesById[20] = "LE"] = 20;
        values[valuesById[21] = "GT"] = 21;
        values[valuesById[22] = "GE"] = 22;
        values[valuesById[23] = "NOT"] = 23;
        values[valuesById[24] = "ADD"] = 24;
        values[valuesById[25] = "SUB"] = 25;
        values[valuesById[26] = "MUL"] = 26;
        values[valuesById[27] = "DIV"] = 27;
        values[valuesById[28] = "MOD"] = 28;
        values[valuesById[183] = "FLOOR"] = 183;
        values[valuesById[184] = "CEIL"] = 184;
        values[valuesById[185] = "ROUND"] = 185;
        values[valuesById[29] = "APPEND"] = 29;
        values[valuesById[80] = "PREPEND"] = 80;
        values[valuesById[95] = "DIFFERENCE"] = 95;
        values[valuesById[88] = "SET_INSERT"] = 88;
        values[valuesById[89] = "SET_INTERSECTION"] = 89;
        values[valuesById[90] = "SET_UNION"] = 90;
        values[valuesById[91] = "SET_DIFFERENCE"] = 91;
        values[valuesById[30] = "SLICE"] = 30;
        values[valuesById[70] = "SKIP"] = 70;
        values[valuesById[71] = "LIMIT"] = 71;
        values[valuesById[87] = "OFFSETS_OF"] = 87;
        values[valuesById[93] = "CONTAINS"] = 93;
        values[valuesById[31] = "GET_FIELD"] = 31;
        values[valuesById[94] = "KEYS"] = 94;
        values[valuesById[186] = "VALUES"] = 186;
        values[valuesById[143] = "OBJECT"] = 143;
        values[valuesById[32] = "HAS_FIELDS"] = 32;
        values[valuesById[96] = "WITH_FIELDS"] = 96;
        values[valuesById[33] = "PLUCK"] = 33;
        values[valuesById[34] = "WITHOUT"] = 34;
        values[valuesById[35] = "MERGE"] = 35;
        values[valuesById[36] = "BETWEEN_DEPRECATED"] = 36;
        values[valuesById[182] = "BETWEEN"] = 182;
        values[valuesById[37] = "REDUCE"] = 37;
        values[valuesById[38] = "MAP"] = 38;
        values[valuesById[187] = "FOLD"] = 187;
        values[valuesById[39] = "FILTER"] = 39;
        values[valuesById[40] = "CONCAT_MAP"] = 40;
        values[valuesById[41] = "ORDER_BY"] = 41;
        values[valuesById[42] = "DISTINCT"] = 42;
        values[valuesById[43] = "COUNT"] = 43;
        values[valuesById[86] = "IS_EMPTY"] = 86;
        values[valuesById[44] = "UNION"] = 44;
        values[valuesById[45] = "NTH"] = 45;
        values[valuesById[170] = "BRACKET"] = 170;
        values[valuesById[48] = "INNER_JOIN"] = 48;
        values[valuesById[49] = "OUTER_JOIN"] = 49;
        values[valuesById[50] = "EQ_JOIN"] = 50;
        values[valuesById[72] = "ZIP"] = 72;
        values[valuesById[173] = "RANGE"] = 173;
        values[valuesById[82] = "INSERT_AT"] = 82;
        values[valuesById[83] = "DELETE_AT"] = 83;
        values[valuesById[84] = "CHANGE_AT"] = 84;
        values[valuesById[85] = "SPLICE_AT"] = 85;
        values[valuesById[51] = "COERCE_TO"] = 51;
        values[valuesById[52] = "TYPE_OF"] = 52;
        values[valuesById[53] = "UPDATE"] = 53;
        values[valuesById[54] = "DELETE"] = 54;
        values[valuesById[55] = "REPLACE"] = 55;
        values[valuesById[56] = "INSERT"] = 56;
        values[valuesById[57] = "DB_CREATE"] = 57;
        values[valuesById[58] = "DB_DROP"] = 58;
        values[valuesById[59] = "DB_LIST"] = 59;
        values[valuesById[60] = "TABLE_CREATE"] = 60;
        values[valuesById[61] = "TABLE_DROP"] = 61;
        values[valuesById[62] = "TABLE_LIST"] = 62;
        values[valuesById[174] = "CONFIG"] = 174;
        values[valuesById[175] = "STATUS"] = 175;
        values[valuesById[177] = "WAIT"] = 177;
        values[valuesById[176] = "RECONFIGURE"] = 176;
        values[valuesById[179] = "REBALANCE"] = 179;
        values[valuesById[138] = "SYNC"] = 138;
        values[valuesById[188] = "GRANT"] = 188;
        values[valuesById[75] = "INDEX_CREATE"] = 75;
        values[valuesById[76] = "INDEX_DROP"] = 76;
        values[valuesById[77] = "INDEX_LIST"] = 77;
        values[valuesById[139] = "INDEX_STATUS"] = 139;
        values[valuesById[140] = "INDEX_WAIT"] = 140;
        values[valuesById[156] = "INDEX_RENAME"] = 156;
        values[valuesById[189] = "SET_WRITE_HOOK"] = 189;
        values[valuesById[190] = "GET_WRITE_HOOK"] = 190;
        values[valuesById[64] = "FUNCALL"] = 64;
        values[valuesById[65] = "BRANCH"] = 65;
        values[valuesById[66] = "OR"] = 66;
        values[valuesById[67] = "AND"] = 67;
        values[valuesById[68] = "FOR_EACH"] = 68;
        values[valuesById[69] = "FUNC"] = 69;
        values[valuesById[73] = "ASC"] = 73;
        values[valuesById[74] = "DESC"] = 74;
        values[valuesById[79] = "INFO"] = 79;
        values[valuesById[97] = "MATCH"] = 97;
        values[valuesById[141] = "UPCASE"] = 141;
        values[valuesById[142] = "DOWNCASE"] = 142;
        values[valuesById[81] = "SAMPLE"] = 81;
        values[valuesById[92] = "DEFAULT"] = 92;
        values[valuesById[98] = "JSON"] = 98;
        values[valuesById[99] = "ISO8601"] = 99;
        values[valuesById[100] = "TO_ISO8601"] = 100;
        values[valuesById[101] = "EPOCH_TIME"] = 101;
        values[valuesById[102] = "TO_EPOCH_TIME"] = 102;
        values[valuesById[103] = "NOW"] = 103;
        values[valuesById[104] = "IN_TIMEZONE"] = 104;
        values[valuesById[105] = "DURING"] = 105;
        values[valuesById[106] = "DATE"] = 106;
        values[valuesById[126] = "TIME_OF_DAY"] = 126;
        values[valuesById[127] = "TIMEZONE"] = 127;
        values[valuesById[128] = "YEAR"] = 128;
        values[valuesById[129] = "MONTH"] = 129;
        values[valuesById[130] = "DAY"] = 130;
        values[valuesById[131] = "DAY_OF_WEEK"] = 131;
        values[valuesById[132] = "DAY_OF_YEAR"] = 132;
        values[valuesById[133] = "HOURS"] = 133;
        values[valuesById[134] = "MINUTES"] = 134;
        values[valuesById[135] = "SECONDS"] = 135;
        values[valuesById[136] = "TIME"] = 136;
        values[valuesById[107] = "MONDAY"] = 107;
        values[valuesById[108] = "TUESDAY"] = 108;
        values[valuesById[109] = "WEDNESDAY"] = 109;
        values[valuesById[110] = "THURSDAY"] = 110;
        values[valuesById[111] = "FRIDAY"] = 111;
        values[valuesById[112] = "SATURDAY"] = 112;
        values[valuesById[113] = "SUNDAY"] = 113;
        values[valuesById[114] = "JANUARY"] = 114;
        values[valuesById[115] = "FEBRUARY"] = 115;
        values[valuesById[116] = "MARCH"] = 116;
        values[valuesById[117] = "APRIL"] = 117;
        values[valuesById[118] = "MAY"] = 118;
        values[valuesById[119] = "JUNE"] = 119;
        values[valuesById[120] = "JULY"] = 120;
        values[valuesById[121] = "AUGUST"] = 121;
        values[valuesById[122] = "SEPTEMBER"] = 122;
        values[valuesById[123] = "OCTOBER"] = 123;
        values[valuesById[124] = "NOVEMBER"] = 124;
        values[valuesById[125] = "DECEMBER"] = 125;
        values[valuesById[137] = "LITERAL"] = 137;
        values[valuesById[144] = "GROUP"] = 144;
        values[valuesById[145] = "SUM"] = 145;
        values[valuesById[146] = "AVG"] = 146;
        values[valuesById[147] = "MIN"] = 147;
        values[valuesById[148] = "MAX"] = 148;
        values[valuesById[149] = "SPLIT"] = 149;
        values[valuesById[150] = "UNGROUP"] = 150;
        values[valuesById[151] = "RANDOM"] = 151;
        values[valuesById[152] = "CHANGES"] = 152;
        values[valuesById[154] = "ARGS"] = 154;
        values[valuesById[155] = "BINARY"] = 155;
        values[valuesById[157] = "GEOJSON"] = 157;
        values[valuesById[158] = "TO_GEOJSON"] = 158;
        values[valuesById[159] = "POINT"] = 159;
        values[valuesById[160] = "LINE"] = 160;
        values[valuesById[161] = "POLYGON"] = 161;
        values[valuesById[162] = "DISTANCE"] = 162;
        values[valuesById[163] = "INTERSECTS"] = 163;
        values[valuesById[164] = "INCLUDES"] = 164;
        values[valuesById[165] = "CIRCLE"] = 165;
        values[valuesById[166] = "GET_INTERSECTING"] = 166;
        values[valuesById[167] = "FILL"] = 167;
        values[valuesById[168] = "GET_NEAREST"] = 168;
        values[valuesById[171] = "POLYGON_SUB"] = 171;
        values[valuesById[172] = "TO_JSON_STRING"] = 172;
        values[valuesById[180] = "MINVAL"] = 180;
        values[valuesById[181] = "MAXVAL"] = 181;
        values[valuesById[191] = "BIT_AND"] = 191;
        values[valuesById[192] = "BIT_OR"] = 192;
        values[valuesById[193] = "BIT_XOR"] = 193;
        values[valuesById[194] = "BIT_NOT"] = 194;
        values[valuesById[195] = "BIT_SAL"] = 195;
        values[valuesById[196] = "BIT_SAR"] = 196;
        return values;
    })();

    Term.AssocPair = (function() {

        /**
         * Properties of an AssocPair.
         * @memberof Term
         * @interface IAssocPair
         * @property {string|null} [key] AssocPair key
         * @property {ITerm|null} [val] AssocPair val
         */

        /**
         * Constructs a new AssocPair.
         * @memberof Term
         * @classdesc Represents an AssocPair.
         * @implements IAssocPair
         * @constructor
         * @param {Term.IAssocPair=} [properties] Properties to set
         */
        function AssocPair(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AssocPair key.
         * @member {string} key
         * @memberof Term.AssocPair
         * @instance
         */
        AssocPair.prototype.key = "";

        /**
         * AssocPair val.
         * @member {ITerm|null|undefined} val
         * @memberof Term.AssocPair
         * @instance
         */
        AssocPair.prototype.val = null;

        /**
         * Creates a new AssocPair instance using the specified properties.
         * @function create
         * @memberof Term.AssocPair
         * @static
         * @param {Term.IAssocPair=} [properties] Properties to set
         * @returns {Term.AssocPair} AssocPair instance
         */
        AssocPair.create = function create(properties) {
            return new AssocPair(properties);
        };

        /**
         * Encodes the specified AssocPair message. Does not implicitly {@link Term.AssocPair.verify|verify} messages.
         * @function encode
         * @memberof Term.AssocPair
         * @static
         * @param {Term.IAssocPair} message AssocPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssocPair.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && message.hasOwnProperty("key"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
            if (message.val != null && message.hasOwnProperty("val"))
                $root.Term.encode(message.val, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AssocPair message, length delimited. Does not implicitly {@link Term.AssocPair.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Term.AssocPair
         * @static
         * @param {Term.IAssocPair} message AssocPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssocPair.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AssocPair message from the specified reader or buffer.
         * @function decode
         * @memberof Term.AssocPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Term.AssocPair} AssocPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssocPair.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Term.AssocPair();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.val = $root.Term.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AssocPair message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Term.AssocPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Term.AssocPair} AssocPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssocPair.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AssocPair message.
         * @function verify
         * @memberof Term.AssocPair
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AssocPair.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!$util.isString(message.key))
                    return "key: string expected";
            if (message.val != null && message.hasOwnProperty("val")) {
                var error = $root.Term.verify(message.val);
                if (error)
                    return "val." + error;
            }
            return null;
        };

        /**
         * Creates an AssocPair message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Term.AssocPair
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Term.AssocPair} AssocPair
         */
        AssocPair.fromObject = function fromObject(object) {
            if (object instanceof $root.Term.AssocPair)
                return object;
            var message = new $root.Term.AssocPair();
            if (object.key != null)
                message.key = String(object.key);
            if (object.val != null) {
                if (typeof object.val !== "object")
                    throw TypeError(".Term.AssocPair.val: object expected");
                message.val = $root.Term.fromObject(object.val);
            }
            return message;
        };

        /**
         * Creates a plain object from an AssocPair message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Term.AssocPair
         * @static
         * @param {Term.AssocPair} message AssocPair
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AssocPair.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.key = "";
                object.val = null;
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.val != null && message.hasOwnProperty("val"))
                object.val = $root.Term.toObject(message.val, options);
            return object;
        };

        /**
         * Converts this AssocPair to JSON.
         * @function toJSON
         * @memberof Term.AssocPair
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AssocPair.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AssocPair;
    })();

    return Term;
})();

module.exports = $root;

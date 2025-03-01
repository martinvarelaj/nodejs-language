// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const gapicConfig = require('./language_service_client_config.json');
const gax = require('google-gax');
const path = require('path');

const VERSION = require('../../package.json').version;

/**
 * Provides text analysis operations such as sentiment analysis and entity
 * recognition.
 *
 * @class
 * @memberof v1
 */
class LanguageServiceClient {
  /**
   * Construct an instance of LanguageServiceClient.
   *
   * @param {object} [options] - The configuration object. See the subsequent
   *   parameters for more details.
   * @param {object} [options.credentials] - Credentials object.
   * @param {string} [options.credentials.client_email]
   * @param {string} [options.credentials.private_key]
   * @param {string} [options.email] - Account email address. Required when
   *     using a .pem or .p12 keyFilename.
   * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
   *     .p12 key downloaded from the Google Developers Console. If you provide
   *     a path to a JSON file, the projectId option below is not necessary.
   *     NOTE: .pem and .p12 require you to specify options.email as well.
   * @param {number} [options.port] - The port on which to connect to
   *     the remote host.
   * @param {string} [options.projectId] - The project ID from the Google
   *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
   *     the environment variable GCLOUD_PROJECT for your project ID. If your
   *     app is running in an environment which supports
   *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
   *     your project ID will be detected automatically.
   * @param {function} [options.promise] - Custom promise module to use instead
   *     of native Promises.
   * @param {string} [options.apiEndpoint] - The domain name of the
   *     API remote host.
   */
  constructor(opts) {
    opts = opts || {};
    this._descriptors = {};

    if (global.isBrowser) {
      // If we're in browser, we use gRPC fallback.
      opts.fallback = true;
    }

    // If we are in browser, we are already using fallback because of the
    // "browser" field in package.json.
    // But if we were explicitly requested to use fallback, let's do it now.
    const gaxModule = !global.isBrowser && opts.fallback ? gax.fallback : gax;

    const servicePath =
      opts.servicePath || opts.apiEndpoint || this.constructor.servicePath;

    // Ensure that options include the service address and port.
    opts = Object.assign(
      {
        clientConfig: {},
        port: this.constructor.port,
        servicePath,
      },
      opts
    );

    // Create a `gaxGrpc` object, with any grpc-specific options
    // sent to the client.
    opts.scopes = this.constructor.scopes;
    const gaxGrpc = new gaxModule.GrpcClient(opts);

    // Save the auth object to the client, for use by other methods.
    this.auth = gaxGrpc.auth;

    // Determine the client header string.
    const clientHeader = [];

    if (typeof process !== 'undefined' && 'versions' in process) {
      clientHeader.push(`gl-node/${process.versions.node}`);
    }
    clientHeader.push(`gax/${gaxModule.version}`);
    if (opts.fallback) {
      clientHeader.push(`gl-web/${gaxModule.version}`);
    } else {
      clientHeader.push(`grpc/${gaxGrpc.grpcVersion}`);
    }
    clientHeader.push(`gapic/${VERSION}`);
    if (opts.libName && opts.libVersion) {
      clientHeader.push(`${opts.libName}/${opts.libVersion}`);
    }

    // Load the applicable protos.
    // For Node.js, pass the path to JSON proto file.
    // For browsers, pass the JSON content.

    const nodejsProtoPath = path.join(
      __dirname,
      '..',
      '..',
      'protos',
      'protos.json'
    );
    const protos = gaxGrpc.loadProto(
      opts.fallback ? require('../../protos/protos.json') : nodejsProtoPath
    );

    // Put together the default options sent with requests.
    const defaults = gaxGrpc.constructSettings(
      'google.cloud.language.v1.LanguageService',
      gapicConfig,
      opts.clientConfig,
      {'x-goog-api-client': clientHeader.join(' ')}
    );

    // Set up a dictionary of "inner API calls"; the core implementation
    // of calling the API is handled in `google-gax`, with this code
    // merely providing the destination and request information.
    this._innerApiCalls = {};

    // Put together the "service stub" for
    // google.cloud.language.v1.LanguageService.
    const languageServiceStub = gaxGrpc.createStub(
      opts.fallback
        ? protos.lookupService('google.cloud.language.v1.LanguageService')
        : protos.google.cloud.language.v1.LanguageService,
      opts
    );

    // Iterate over each of the methods that the service provides
    // and create an API call method for each.
    const languageServiceStubMethods = [
      'analyzeSentiment',
      'analyzeEntities',
      'analyzeEntitySentiment',
      'analyzeSyntax',
      'classifyText',
      'annotateText',
    ];
    for (const methodName of languageServiceStubMethods) {
      const innerCallPromise = languageServiceStub.then(
        stub => (...args) => {
          return stub[methodName].apply(stub, args);
        },
        err => () => {
          throw err;
        }
      );
      this._innerApiCalls[methodName] = gaxModule.createApiCall(
        innerCallPromise,
        defaults[methodName],
        null
      );
    }
  }

  /**
   * The DNS address for this API service.
   */
  static get servicePath() {
    return 'language.googleapis.com';
  }

  /**
   * The DNS address for this API service - same as servicePath(),
   * exists for compatibility reasons.
   */
  static get apiEndpoint() {
    return 'language.googleapis.com';
  }

  /**
   * The port for this API service.
   */
  static get port() {
    return 443;
  }

  /**
   * The scopes needed to make gRPC calls for every method defined
   * in this service.
   */
  static get scopes() {
    return [
      'https://www.googleapis.com/auth/cloud-language',
      'https://www.googleapis.com/auth/cloud-platform',
    ];
  }

  /**
   * Return the project ID used by this class.
   * @param {function(Error, string)} callback - the callback to
   *   be called with the current project Id.
   */
  getProjectId(callback) {
    return this.auth.getProjectId(callback);
  }

  // -------------------
  // -- Service calls --
  // -------------------

  /**
   * Analyzes the sentiment of the provided text.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object} request.document
   *   Input document.
   *
   *   This object should have the same structure as [Document]{@link google.cloud.language.v1.Document}
   * @param {number} [request.encodingType]
   *   The encoding type used by the API to calculate sentence offsets.
   *
   *   The number should be among the values of [EncodingType]{@link google.cloud.language.v1.EncodingType}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [AnalyzeSentimentResponse]{@link google.cloud.language.v1.AnalyzeSentimentResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [AnalyzeSentimentResponse]{@link google.cloud.language.v1.AnalyzeSentimentResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const language = require('@google-cloud/language');
   *
   * const client = new language.v1.LanguageServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const document = {};
   * client.analyzeSentiment({document: document})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  analyzeSentiment(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.analyzeSentiment(request, options, callback);
  }

  /**
   * Finds named entities (currently proper names and common nouns) in the text
   * along with entity types, salience, mentions for each entity, and
   * other properties.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object} request.document
   *   Input document.
   *
   *   This object should have the same structure as [Document]{@link google.cloud.language.v1.Document}
   * @param {number} [request.encodingType]
   *   The encoding type used by the API to calculate offsets.
   *
   *   The number should be among the values of [EncodingType]{@link google.cloud.language.v1.EncodingType}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [AnalyzeEntitiesResponse]{@link google.cloud.language.v1.AnalyzeEntitiesResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [AnalyzeEntitiesResponse]{@link google.cloud.language.v1.AnalyzeEntitiesResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const language = require('@google-cloud/language');
   *
   * const client = new language.v1.LanguageServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const document = {};
   * client.analyzeEntities({document: document})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  analyzeEntities(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.analyzeEntities(request, options, callback);
  }

  /**
   * Finds entities, similar to AnalyzeEntities in the text and analyzes
   * sentiment associated with each entity and its mentions.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object} request.document
   *   Input document.
   *
   *   This object should have the same structure as [Document]{@link google.cloud.language.v1.Document}
   * @param {number} [request.encodingType]
   *   The encoding type used by the API to calculate offsets.
   *
   *   The number should be among the values of [EncodingType]{@link google.cloud.language.v1.EncodingType}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [AnalyzeEntitySentimentResponse]{@link google.cloud.language.v1.AnalyzeEntitySentimentResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [AnalyzeEntitySentimentResponse]{@link google.cloud.language.v1.AnalyzeEntitySentimentResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const language = require('@google-cloud/language');
   *
   * const client = new language.v1.LanguageServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const document = {};
   * client.analyzeEntitySentiment({document: document})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  analyzeEntitySentiment(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.analyzeEntitySentiment(
      request,
      options,
      callback
    );
  }

  /**
   * Analyzes the syntax of the text and provides sentence boundaries and
   * tokenization along with part of speech tags, dependency trees, and other
   * properties.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object} request.document
   *   Input document.
   *
   *   This object should have the same structure as [Document]{@link google.cloud.language.v1.Document}
   * @param {number} [request.encodingType]
   *   The encoding type used by the API to calculate offsets.
   *
   *   The number should be among the values of [EncodingType]{@link google.cloud.language.v1.EncodingType}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [AnalyzeSyntaxResponse]{@link google.cloud.language.v1.AnalyzeSyntaxResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [AnalyzeSyntaxResponse]{@link google.cloud.language.v1.AnalyzeSyntaxResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const language = require('@google-cloud/language');
   *
   * const client = new language.v1.LanguageServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const document = {};
   * client.analyzeSyntax({document: document})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  analyzeSyntax(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.analyzeSyntax(request, options, callback);
  }

  /**
   * Classifies a document into categories.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object} request.document
   *   Input document.
   *
   *   This object should have the same structure as [Document]{@link google.cloud.language.v1.Document}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [ClassifyTextResponse]{@link google.cloud.language.v1.ClassifyTextResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [ClassifyTextResponse]{@link google.cloud.language.v1.ClassifyTextResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const language = require('@google-cloud/language');
   *
   * const client = new language.v1.LanguageServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const document = {};
   * client.classifyText({document: document})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  classifyText(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.classifyText(request, options, callback);
  }

  /**
   * A convenience method that provides all the features that analyzeSentiment,
   * analyzeEntities, and analyzeSyntax provide in one call.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object} request.document
   *   Input document.
   *
   *   This object should have the same structure as [Document]{@link google.cloud.language.v1.Document}
   * @param {Object} request.features
   *   The enabled features.
   *
   *   This object should have the same structure as [Features]{@link google.cloud.language.v1.Features}
   * @param {number} [request.encodingType]
   *   The encoding type used by the API to calculate offsets.
   *
   *   The number should be among the values of [EncodingType]{@link google.cloud.language.v1.EncodingType}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [AnnotateTextResponse]{@link google.cloud.language.v1.AnnotateTextResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [AnnotateTextResponse]{@link google.cloud.language.v1.AnnotateTextResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const language = require('@google-cloud/language');
   *
   * const client = new language.v1.LanguageServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const document = {};
   * const features = {};
   * const request = {
   *   document: document,
   *   features: features,
   * };
   * client.annotateText(request)
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  annotateText(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.annotateText(request, options, callback);
  }
}

module.exports = LanguageServiceClient;

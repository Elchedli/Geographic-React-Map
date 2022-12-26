import axios, { AxiosInstance } from 'axios';
import {
  ApiCollection,
  ApiErrorResponse,
  ApiResponse,
  ApiDocument,
} from 'interfaces/api';
import { GeoMapInterface } from 'interfaces/geo-map';
import { PageCarto } from 'interfaces/page-carto';
import { User, UserAuthResponse, UserSignUpFields } from 'interfaces/user';

export enum ContentType {
  PAGE_CARTOS = 'page-cartos',
  GEO_MAPS = 'geo-maps',
  USERS = 'users',
  THUMBNAIL = 'geo-maps/thumbnail',
}

type ObjectType<T> = T extends ContentType.PAGE_CARTOS
  ? PageCarto
  : T extends ContentType.GEO_MAPS
  ? GeoMapInterface
  : T extends ContentType.USERS
  ? User
  : never;

type FilterOperator =
  | '$eq' //	Equal
  | '$eqi' //	Equal (case-insensitive)
  | '$ne' //	Not equal
  | '$lt' //	Less than
  | '$lte' //	Less than or equal to
  | '$gt' //	Greater than
  | '$gte' //	Greater than or equal to
  | '$in' //	Included in an array
  | '$notIn' //	Not included in an array
  | '$contains' //	Contains
  | '$notContains' //	Does not contain
  | '$containsi' //	Contains (case-insensitive)
  | '$notContainsi' //	Does not contain (case-insensitive)
  | '$null' //	Is null
  | '$notNull' //	Is not null
  | '$between' //	Is between
  | '$startsWith' //	Starts with
  | '$endsWith' //	Ends with
  | '$or' //	Joins the filters in an "or" expression
  | '$and'; //	Joins the filters in an "and" expression

export type QueryParams = {
  filters?: {
    [field: string]: { [operator in FilterOperator]?: any };
  };
  populate?: string | string[] | { [field: string]: { populate: string[] } };
  sort?: string | string[]; // exp. 'createdAt:desc'
  pagination?: {
    page?: number; // default 1
    pageSize?: number; // default 25
    start?: number; // default 0
    limit?: number; // default 25
    withCount?: boolean;
  };
};

class Strapi {
  public token: string | undefined;
  public request: AxiosInstance;

  /**
   * A strapi-client instance.
   */
  constructor(baseURL: string) {
    /** @type {string} A valid JSONWebToken. */
    this.token = undefined;
    this.request = axios.create({ baseURL });

    // Request Interceptor
    this.request.interceptors.request.use(
      (config) => {
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.request.interceptors.response.use(
      (resp) => resp.data,
      (error) => Promise.reject(error.response.data)
    );
  }

  /**
   * Get currently authenticated user.
   */
  currentUser(token: string): Promise<User> {
    if (token) this.token = token;
    return this.request
      .get<void, User>('/users/me')
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Update current user
   */
  updateCurrentUser(
    userId: number,
    data: Pick<User, 'username' | 'email' | 'password'>
  ) {
    return this.request
      .put<Pick<User, 'username' | 'email' | 'password'>, User>(
        `/users/${userId}`,
        data
      )
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Login and generate an authenticated token.
   */
  login(identifier: string, password: string): Promise<UserAuthResponse> {
    return this.request
      .post<{ identifier: string; password: string }, UserAuthResponse>(
        '/auth/local',
        { identifier, password }
      )
      .then(({ user, jwt }) => {
        this.token = jwt;
        return { jwt, user };
      })
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Remove token on logout
   */
  logout() {
    this.token = undefined;
  }

  /**
   * Register a new user.
   */
  register(data: UserSignUpFields): Promise<UserAuthResponse> {
    return this.request
      .post<UserSignUpFields, UserAuthResponse>('/auth/local/register', data)
      .then(({ jwt, user }) => {
        this.token = jwt;
        return { jwt, user };
      })
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  // TODO: Forgot password, Reset password

  /**
   * Forgot password
   * @param {string} email - Email that will recieve the link for password reset
   */
  forgotPassword(email: string): Promise<boolean> {
    return this.request
      .post<{ email: string }, boolean>('/auth/forgot-password', { email })
      .then((response) => response)
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Reset password
   */
  resetPassword(
    code: string,
    password: string,
    passwordConfirmation: string
  ): Promise<UserAuthResponse> {
    return this.request
      .post<
        { code: string; password: string; passwordConfirmation: string },
        UserAuthResponse
      >('/auth/reset-password', { code, password, passwordConfirmation })
      .then(({ jwt, user }) => {
        this.token = jwt;
        return { jwt, user };
      })
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Count the data of a content-type.
   */
  count<T extends ContentType>(contentType: T, params: QueryParams) {
    return this.request
      .get<QueryParams, ObjectType<T>>(
        `/${contentType}/count`,
        params && { params }
      )
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Create an entry to the given content-type.
   */
  create<T extends ContentType>(contentType: T, data: ObjectType<T>) {
    return this.request
      .post<ObjectType<T>, ApiResponse<ApiDocument<ObjectType<T>>>>(
        `/${contentType}`,
        data
      )
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * get a content-type entry by id.
   */
  getById<T extends ContentType>(contentType: T, id: number) {
    return this.request
      .get<void, ApiResponse<ObjectType<T>>>(`/${contentType}/${id}`)
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Get a content-type collection.
   */
  get<T extends ContentType>(contentType: T, params?: QueryParams) {
    return this.request
      .get<QueryParams, ApiCollection<ObjectType<T>>>(
        `/${contentType}`,
        params && {
          params,
        }
      )
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Update an entry in a content-type.
   */
  update<T extends ContentType>(
    contentType: T,
    id: number,
    data: Partial<ObjectType<T>>
  ) {
    return this.request
      .put<Partial<ObjectType<T>>, ApiResponse<ApiDocument<ObjectType<T>>>>(
        `/${contentType}/${id}`,
        data
      )
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }

  /**
   * Delete an entry.
   */
  delete<T extends ContentType>(contentType: ContentType, id: number) {
    return this.request
      .delete<void, ApiResponse<ApiDocument<ObjectType<T>>>>(
        `/${contentType}/${id}`
      )
      .catch(({ error }: ApiErrorResponse) => {
        throw error;
      });
  }
}

export const strapi = new Strapi('http://localhost:1337/api');

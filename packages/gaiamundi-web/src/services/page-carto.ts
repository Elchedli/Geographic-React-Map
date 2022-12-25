import { PageCarto, PageCartoStub } from 'interfaces/page-carto';
import { ContentType, strapi } from './strapi';

export const createPageCarto = async (data: PageCartoStub) => {
  return await strapi.create<PageCartoStub>(ContentType.PAGE_CARTOS, data);
};

export const getLatestPageCartos = async (page: number, pageSize: number) => {
  return await strapi.get<PageCarto>(ContentType.PAGE_CARTOS, {
    populate: '*',
    sort: 'createdAt:desc',
    pagination: {
      page,
      pageSize,
    },
  });
};

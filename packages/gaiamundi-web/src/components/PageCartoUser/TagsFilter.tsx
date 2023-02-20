import { Button } from 'components/Button/Button';
import { Label } from 'components/Forms/Inputs/Label';
import CloseCross from 'components/Icons/CloseCross';
import { Badge } from 'components/Tags/Badge';
import { ApiData } from 'interfaces/api';
import { Tag } from 'interfaces/page-carto';
import { GroupedTags } from 'interfaces/tag';
import { FC, useMemo, useState } from 'react';
import { groupByApiData as groupApiDataBy } from 'utils/strapiUtils';

interface TagsFilterProp {
  onChange: (selectedTagIds: number[]) => void;
  tags: ApiData<Tag>[];
}

export const TagsFilter: FC<TagsFilterProp> = ({
  onChange,
  tags: response,
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const groupedTags: GroupedTags = useMemo(() => {
    return groupApiDataBy(
      response?.filter((tag) => selectedTagIds.indexOf(tag.id) === -1) || [],
      (tag: ApiData<Tag>) => tag.attributes.type
    );
  }, [selectedTagIds, response]);

  const selectedTags = useMemo(() => {
    return (
      response?.filter((tag) => {
        return selectedTagIds.indexOf(tag.id) !== -1;
      }) || []
    );
  }, [selectedTagIds, response]);

  const handleAddTag = (tagId: number) => {
    setSelectedTagIds([...selectedTagIds, tagId]);
    onChange([...selectedTagIds, tagId]);
  };

  const handleRemoveTag = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.filter((id) => id !== tagId);
    setSelectedTagIds(newSelectedTagIds);
    onChange(newSelectedTagIds);
  };

  const reset = () => {
    setSelectedTagIds([]);
    onChange([]);
  };

  return (
    <div className="lg:max-w-sm">
      <div>
        {selectedTagIds.length > 0 && (
          <div className="flex justify-between">
            <Label htmlFor="Nom" className="text-base flex self-center">
              Filtres
            </Label>
            <Button
              type="button"
              color="transparent"
              className="text-base"
              onClick={reset}
            >
              Effacer tout
            </Button>
          </div>
        )}

        <div className="">
          {selectedTags.map((tag) => {
            return (
              <Badge
                href="#"
                className="px-4 py-2 rounded-full text-gray-200 bg-gray-600 border border-gray-300 font-semibold text-sm inline-flex align-center w-max cursor-pointer active:bg-gray-300 transition duration-300 ease"
                onClick={() => handleRemoveTag(tag.id)}
                key={tag.attributes.id}
                iconAfter={<CloseCross />}
              >
                {tag.attributes.name}
              </Badge>
            );
          })}
        </div>
      </div>

      {Object.entries(groupedTags).map(([group, tags]) => (
        <>
          {tags.length > 0 && <Label className="text-xl">{group}</Label>}
          <div className="my-3">
            {tags.map((tag: ApiData<Tag>) => {
              return (
                <Badge
                  href="#"
                  key={tag.id}
                  className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 inline-flex text-sm font-semibold mr-2 mb-2 lg:block w-max "
                  onClick={() => handleAddTag(tag.id)}
                >
                  {tag.attributes.name}
                  <span className="inline-block ml-2 bg-white w-6 border rounded-full text-black text-center">
                    {tag.attributes.count}
                  </span>
                </Badge>
              );
            })}
          </div>
        </>
      ))}
    </div>
  );
};

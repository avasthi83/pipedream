import common from "../common/metafield-actions.mjs";
import consts from "../common/consts.mjs";

export default {
  ...common,
  key: "shopify-update-metafield",
  name: "Update Metafield",
  description: "Updates a metafield belonging to a resource. [See the docs](https://shopify.dev/api/admin-rest/2023-01/resources/metafield#put-blogs-blog-id-metafields-metafield-id)",
  version: "0.0.3",
  type: "action",
  async additionalProps() {
    const props = await this.getOwnerIdProp(this.ownerResource);

    if (props.ownerId) {
      props.ownerId = {
        ...props.ownerId,
        reloadProps: true,
      };
    }

    if (this.ownerResource && this.ownerId) {
      props.metafieldId = {
        type: "string",
        label: "Metafield ID",
        description: "The metafield to update",
        options: async () => {
          return this.shopify.getMetafieldOptions(this.ownerResource, this.ownerId);
        },
        reloadProps: true,
      };
    }

    if (this.metafieldId) {
      const { result } = await this.shopify.getMetafield(this.metafieldId);
      props.value = {
        type: consts.METAFIELD_TYPES[result.type],
        label: "Value",
        description: "The data to store in the metafield",
      };
    }

    return props;
  },
  async run({ $ }) {
    const { result } = await this.shopify.getMetafield(this.metafieldId);

    const value = result.type.includes("list.")
      ? JSON.stringify(this.value)
      : this.value;

    const params = {
      metafield_id: this.metafieldId,
      owner_id: `${this.ownerId}`,
      owner_resource: this.ownerResource,
      key: result.key,
      type: this.type,
      value: value,
      namespace: result.namespace,
    };
    const response = await this.shopify.updateMetafield(this.metafieldId, params);
    $.export("$summary", `Updated metafield for object with ID ${this.ownerId}`);
    return response;
  },
};

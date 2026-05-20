import Product, { IProduct } from "../../models/product.model";
import {BaseRepository}from "../baseRepository/base.repository"

export class ProdectRepo extends BaseRepository<IProduct>{
    constructor(){super(Product)}

    async findWithFilters(search: string, page: number, limit: number, sortField: string, sortOrder: number, productType?: string, forGender?: string): Promise<{ data: IProduct[], total: number }> {
        const query: any = {};
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { productType: { $regex: search, $options: 'i' } },
                { brandName: { $regex: search, $options: 'i' } }
            ];
        }

        if (productType) {
            query.productType = productType;
        }

        if (forGender) {
            query.for = forGender;
        }

        const skip = (page - 1) * limit;
        
        const [data, total] = await Promise.all([
            Product.find(query)
                .sort({ [sortField]: sortOrder as any })
                .skip(skip)
                .limit(limit)
                .exec(),
            Product.countDocuments(query).exec()
        ]);

        return { data, total };
    }
}

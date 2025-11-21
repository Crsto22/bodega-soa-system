import { supabase } from "@/lib/supabaseClient";
import { Producto } from "@/types/database";

/**
 * Repository de Productos
 * Responsabilidad: SOLO acceso a datos de productos
 */

export interface InsertProducto {
    nombre: string;
    categoria?: string;
    marca?: string;
    precio_compra: number;
    precio_venta: number;
    stock: number;
    unidad_medida?: string;
}

export class ProductRepository {
    /**
     * Obtener todos los productos
     */
    async findAll(): Promise<Producto[]> {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('id_producto', { ascending: true });

        if (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Buscar producto por ID
     */
    async findById(id: number): Promise<Producto | null> {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id_producto', id)
            .single();

        if (error) {
            console.error('Error obteniendo producto:', error);
            return null;
        }

        return data;
    }

    /**
     * Crear un nuevo producto
     */
    async create(producto: InsertProducto): Promise<Producto> {
        const { data, error } = await supabase
            .from('productos')
            .insert(producto)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear producto: ${error.message}`);
        }

        return data;
    }

    /**
     * Actualizar un producto
     */
    async update(id: number, producto: Partial<InsertProducto>): Promise<Producto> {
        const { data, error } = await supabase
            .from('productos')
            .update(producto)
            .eq('id_producto', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }

        return data;
    }

    /**
     * Eliminar un producto
     */
    async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id_producto', id);

        if (error) {
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }

    /**
     * Actualizar stock de un producto (valor absoluto)
     */
    async updateStock(id: number, nuevoStock: number): Promise<void> {
        const { error } = await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id_producto', id);

        if (error) {
            throw new Error(`Error al actualizar stock: ${error.message}`);
        }
    }

    /**
     * Decrementar stock de un producto
     */
    async decrementarStock(id: number, cantidad: number): Promise<void> {
        const producto = await this.findById(id);

        if (!producto) {
            throw new Error(`Producto ${id} no encontrado`);
        }

        const nuevoStock = producto.stock - cantidad;
        await this.updateStock(id, nuevoStock);
    }

    /**
     * Incrementar stock de un producto
     */
    async incrementarStock(id: number, cantidad: number): Promise<void> {
        const producto = await this.findById(id);

        if (!producto) {
            throw new Error(`Producto ${id} no encontrado`);
        }

        const nuevoStock = producto.stock + cantidad;
        await this.updateStock(id, nuevoStock);
    }

    /**
     * Buscar productos por término
     */
    async search(searchTerm: string): Promise<Producto[]> {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .or(`nombre.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%`)
            .order('id_producto', { ascending: true });

        if (error) {
            throw new Error(`Error al buscar productos: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Obtener productos con stock bajo (menos de 10)
     */
    async findLowStock(): Promise<Producto[]> {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .lt('stock', 10)
            .order('stock', { ascending: true });

        if (error) {
            throw new Error(`Error al obtener productos con stock bajo: ${error.message}`);
        }

        return data || [];
    }
}

// Exportar instancia singleton
export const productRepository = new ProductRepository();

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'is_active',
        'sort_order',
        'parent_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'parent_id' => 'integer',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'services_count',
    ];

    /**
     * Relación con los servicios de esta categoría
     */
    public function services()
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    /**
     * Relación con la categoría padre
     */
    public function parent()
    {
        return $this->belongsTo(ServiceCategory::class, 'parent_id');
    }

    /**
     * Relación con las subcategorías
     */
    public function children()
    {
        return $this->hasMany(ServiceCategory::class, 'parent_id');
    }

    /**
     * Obtiene el número de servicios en esta categoría
     */
    public function getServicesCountAttribute()
    {
        return $this->services()->count();
    }

    /**
     * Scope para categorías activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para categorías de nivel superior (sin padre)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope ordenado por sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc');
    }

    /**
     * Verifica si es una categoría de nivel superior
     */
    public function isTopLevel()
    {
        return is_null($this->parent_id);
    }

    /**
     * Verifica si tiene subcategorías
     */
    public function hasChildren()
    {
        return $this->children()->exists();
    }

    /**
     * Obtiene todas las subcategorías recursivamente
     */
    public function getAllChildren()
    {
        $children = collect([]);

        foreach ($this->children as $child) {
            $children->push($child);
            $children = $children->merge($child->getAllChildren());
        }

        return $children;
    }

    /**
     * Obtiene el path completo de la categoría (incluyendo padres)
     */
    public function getFullPath($separator = ' > ')
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode($separator, $path);
    }

    /**
     * Genera un slug único
     */
    public static function generateUniqueSlug($name)
    {
        $slug = \Illuminate\Support\Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Generar slug automáticamente si no existe
        static::creating(function ($category) {
            if (!$category->slug) {
                $category->slug = self::generateUniqueSlug($category->name);
            }
        });

        // Prevenir eliminación si tiene servicios
        static::deleting(function ($category) {
            if ($category->services()->exists()) {
                throw new \Exception('No se puede eliminar una categoría con servicios. Reasigna los servicios primero.');
            }

            // Eliminar subcategorías
            $category->children()->each(function ($child) {
                $child->delete();
            });
        });
    }

    /**
     * Crea las categorías predeterminadas
     */
    public static function createDefaultCategories()
    {
        $categories = [
            [
                'name' => 'Cabello',
                'slug' => 'cabello',
                'description' => 'Servicios de corte, coloración y tratamiento de cabello',
                'icon' => '✂️',
                'color' => '#FF6B6B',
                'is_active' => true,
                'sort_order' => 1,
                'children' => [
                    ['name' => 'Corte de Cabello', 'icon' => '✂️'],
                    ['name' => 'Coloración', 'icon' => '🎨'],
                    ['name' => 'Tratamientos Capilares', 'icon' => '💆'],
                    ['name' => 'Peinado y Estilo', 'icon' => '💇'],
                ],
            ],
            [
                'name' => 'Uñas',
                'slug' => 'unas',
                'description' => 'Manicura, pedicura y nail art',
                'icon' => '💅',
                'color' => '#FF8CC6',
                'is_active' => true,
                'sort_order' => 2,
                'children' => [
                    ['name' => 'Manicura', 'icon' => '💅'],
                    ['name' => 'Pedicura', 'icon' => '🦶'],
                    ['name' => 'Uñas Acrílicas', 'icon' => '💅'],
                    ['name' => 'Nail Art', 'icon' => '🎨'],
                ],
            ],
            [
                'name' => 'Rostro',
                'slug' => 'rostro',
                'description' => 'Maquillaje y cuidado facial',
                'icon' => '💄',
                'color' => '#FFC93C',
                'is_active' => true,
                'sort_order' => 3,
                'children' => [
                    ['name' => 'Maquillaje', 'icon' => '💄'],
                    ['name' => 'Cejas y Pestañas', 'icon' => '👁️'],
                    ['name' => 'Limpieza Facial', 'icon' => '🧖'],
                    ['name' => 'Tratamientos Faciales', 'icon' => '✨'],
                ],
            ],
            [
                'name' => 'Cuerpo',
                'slug' => 'cuerpo',
                'description' => 'Masajes y tratamientos corporales',
                'icon' => '💆',
                'color' => '#A8E6CF',
                'is_active' => true,
                'sort_order' => 4,
                'children' => [
                    ['name' => 'Masajes', 'icon' => '💆'],
                    ['name' => 'Depilación', 'icon' => '🪒'],
                    ['name' => 'Tratamientos Corporales', 'icon' => '✨'],
                    ['name' => 'Spa', 'icon' => '🧖'],
                ],
            ],
            [
                'name' => 'Barbería',
                'slug' => 'barberia',
                'description' => 'Servicios de barbería masculina',
                'icon' => '🪒',
                'color' => '#4ECDC4',
                'is_active' => true,
                'sort_order' => 5,
                'children' => [
                    ['name' => 'Corte de Cabello', 'icon' => '✂️'],
                    ['name' => 'Afeitado y Barba', 'icon' => '🪒'],
                    ['name' => 'Tratamiento Capilar', 'icon' => '💆'],
                ],
            ],
            [
                'name' => 'Novias',
                'slug' => 'novias',
                'description' => 'Servicios especiales para novias',
                'icon' => '👰',
                'color' => '#FFD3E1',
                'is_active' => true,
                'sort_order' => 6,
                'children' => [
                    ['name' => 'Maquillaje de Novia', 'icon' => '💄'],
                    ['name' => 'Peinado de Novia', 'icon' => '💇'],
                    ['name' => 'Prueba de Maquillaje', 'icon' => '✨'],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = self::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );

            // Crear subcategorías
            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                $childData['is_active'] = true;
                $childData['color'] = $categoryData['color'];

                self::firstOrCreate(
                    [
                        'slug' => self::generateUniqueSlug($childData['name']),
                        'parent_id' => $category->id,
                    ],
                    $childData
                );
            }
        }
    }
}

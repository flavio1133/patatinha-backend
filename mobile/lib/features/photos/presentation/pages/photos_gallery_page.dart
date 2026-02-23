import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/models/photo_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import 'before_after_viewer_page.dart';

class PhotosGalleryPage extends StatefulWidget {
  final int petId;

  const PhotosGalleryPage({super.key, required this.petId});

  @override
  State<PhotosGalleryPage> createState() => _PhotosGalleryPageState();
}

class _PhotosGalleryPageState extends State<PhotosGalleryPage> {
  List<PetPhoto> _photos = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPhotos();
  }

  Future<void> _loadPhotos() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = await ApiService.getPetPhotos(token, widget.petId);
      setState(() {
        _photos = data.map((json) => PetPhoto.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar fotos: $e')),
        );
      }
    }
  }

  List<PetPhoto> get _beforeAfterPairs {
    final pairs = <PetPhoto>[];
    final processedIds = <int>{};

    for (final photo in _photos) {
      if (processedIds.contains(photo.id)) continue;

      if (photo.type == 'before' || photo.type == 'after') {
        if (photo.beforeAfterPairId != null) {
          // É uma foto "depois", buscar a "antes"
          final beforePhoto = _photos.firstWhere(
            (p) => p.id == photo.beforeAfterPairId,
            orElse: () => photo,
          );
          pairs.add(beforePhoto);
          processedIds.add(beforePhoto.id);
          processedIds.add(photo.id);
        } else {
          // É uma foto "antes", verificar se tem "depois"
          final afterPhoto = _photos.firstWhere(
            (p) => p.beforeAfterPairId == photo.id,
            orElse: () => photo,
          );
          if (afterPhoto.id != photo.id) {
            pairs.add(photo);
            processedIds.add(photo.id);
            processedIds.add(afterPhoto.id);
          } else {
            pairs.add(photo);
            processedIds.add(photo.id);
          }
        }
      } else {
        pairs.add(photo);
        processedIds.add(photo.id);
      }
    }

    return pairs;
  }

  List<PetPhoto> get _generalPhotos {
    return _photos.where((p) => p.type == 'general').toList();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_photos.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.photo_library_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Nenhuma foto cadastrada',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    final beforeAfterPairs = _beforeAfterPairs;
    final generalPhotos = _generalPhotos;
    final dateFormat = DateFormat('dd/MM/yyyy');

    return RefreshIndicator(
      onRefresh: _loadPhotos,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Antes e Depois
            if (beforeAfterPairs.isNotEmpty) ...[
              Text(
                'Antes e Depois',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.8,
                ),
                itemCount: beforeAfterPairs.length,
                itemBuilder: (context, index) {
                  final photo = beforeAfterPairs[index];
                  final afterPhoto = photo.beforeAfterPairId != null
                      ? _photos.firstWhere(
                          (p) => p.id == photo.beforeAfterPairId,
                          orElse: () => photo,
                        )
                      : _photos.firstWhere(
                          (p) => p.beforeAfterPairId == photo.id,
                          orElse: () => photo,
                        );

                  return GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BeforeAfterViewerPage(
                            beforePhoto: photo.type == 'before' ? photo : afterPhoto,
                            afterPhoto: photo.type == 'after' ? photo : afterPhoto,
                          ),
                        ),
                      );
                    },
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(
                            photo.imageUrl,
                            fit: BoxFit.cover,
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.7),
                                ],
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    children: [
                                      if (photo.serviceType != null)
                                        Text(
                                          photo.serviceType!.toUpperCase(),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      Text(
                                        dateFormat.format(photo.serviceDate),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Positioned(
                            top: 8,
                            right: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'ANTES/DEPOIS',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),
            ],

            // Fotos Gerais
            if (generalPhotos.isNotEmpty) ...[
              Text(
                'Outras Fotos',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 1,
                ),
                itemCount: generalPhotos.length,
                itemBuilder: (context, index) {
                  final photo = generalPhotos[index];
                  return GestureDetector(
                    onTap: () {
                      // TODO: Abrir visualizador de imagem
                    },
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        photo.imageUrl,
                        fit: BoxFit.cover,
                      ),
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
}

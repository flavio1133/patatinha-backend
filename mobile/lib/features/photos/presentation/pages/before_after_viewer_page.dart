import 'package:flutter/material.dart';
import '../../../../core/models/photo_model.dart';

class BeforeAfterViewerPage extends StatefulWidget {
  final PetPhoto beforePhoto;
  final PetPhoto afterPhoto;

  const BeforeAfterViewerPage({
    super.key,
    required this.beforePhoto,
    required this.afterPhoto,
  });

  @override
  State<BeforeAfterViewerPage> createState() => _BeforeAfterViewerPageState();
}

class _BeforeAfterViewerPageState extends State<BeforeAfterViewerPage> {
  double _sliderValue = 0.5; // 0 = antes, 1 = depois

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Antes e Depois'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implementar compartilhamento
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Foto "depois" (fundo)
          Positioned.fill(
            child: Image.network(
              widget.afterPhoto.imageUrl,
              fit: BoxFit.cover,
            ),
          ),
          // Foto "antes" com clip baseado no slider
          Positioned.fill(
            child: ClipRect(
              child: Align(
                alignment: Alignment.centerLeft,
                widthFactor: _sliderValue,
                child: Image.network(
                  widget.beforePhoto.imageUrl,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
          // Divisor visual
          Positioned.fill(
            child: GestureDetector(
              onHorizontalDragUpdate: (details) {
                final RenderBox box = context.findRenderObject() as RenderBox;
                final localPosition = box.globalToLocal(details.globalPosition);
                final width = box.size.width;
                setState(() {
                  _sliderValue = (localPosition.dx / width).clamp(0.0, 1.0);
                });
              },
              child: Container(
                color: Colors.transparent,
                child: Stack(
                  children: [
                    // Linha divisória
                    Positioned(
                      left: _sliderValue * MediaQuery.of(context).size.width - 2,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.3),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Indicador de arraste
                    Positioned(
                      left: _sliderValue * MediaQuery.of(context).size.width - 20,
                      top: MediaQuery.of(context).size.height / 2 - 20,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.3),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.drag_handle),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Labels
          Positioned(
            top: 40,
            left: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'ANTES',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          Positioned(
            top: 40,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'DEPOIS',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          // Slider na parte inferior
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Slider(
              value: _sliderValue,
              onChanged: (value) {
                setState(() {
                  _sliderValue = value;
                });
              },
              activeColor: Colors.white,
              inactiveColor: Colors.white.withOpacity(0.5),
            ),
          ),
        ],
      ),
    );
  }
}

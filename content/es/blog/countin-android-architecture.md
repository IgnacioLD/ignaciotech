---
title: "CountIn: Arquitectura Android Moderna en la Práctica"
date: 2024-01-20
tags: ["Android", "Kotlin", "Arquitectura", "Tiempo Real", "Firebase"]
description: "Decisiones de arquitectura e implementación de CountIn, una app de control de aforo en tiempo real"
image: "/images/placeholders/blog-edit.svg"
---

Construir CountIn fue una oportunidad para aplicar patrones modernos de arquitectura Android en un caso real con sincronización en tiempo real, funcionamiento offline y coordinación multiusuario.

## Arquitectura

### Presentación
- **Jetpack Compose** para UI declarativa
- **ViewModels** para estado con lifecycle
- **Navigation** tipado
- **Hilt** para DI

### Dominio
- **Use Cases** con la lógica
- **Repositorios** como contratos de datos
- **Modelos de dominio**
- **Eventos** para actualizaciones en tiempo real

### Datos
- **Room** como cache/local
- **Firebase Realtime Database** como backend
- **Repositorios** orquestan fuentes
- **WorkManager** para sincronización en background

## Sincronización en Tiempo Real

### Resolución de Conflictos
Actualizaciones concurrentes requieren atómicos en la nube y optimismo local:

```kotlin
class CounterRepository {
    suspend fun updateCount(delta: Int) {
        // Actualización local optimista
        localDatabase.updateCount(currentCount + delta)
        // Transacción en Firebase
        firebase.runTransaction { snapshot ->
            val currentValue = snapshot.getValue(Int::class.java) ?: 0
            snapshot.ref.setValue(currentValue + delta)
        }
    }
}
```

### Offline-First
- **Operaciones locales primero** con feedback inmediato
- **CRDTs** o estrategias de consistencia eventual
- **Colas de sincronización**
- **Degradación elegante** con indicadores claros

## Gestión de Estado

### UI Reactiva con Compose

```kotlin
@Composable
fun CounterScreen(viewModel: CounterViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    when (uiState) {
        is CounterUiState.Loading -> LoadingIndicator()
        is CounterUiState.Success -> {
            CounterDisplay(
                count = uiState.currentCount,
                capacity = uiState.maxCapacity,
                onIncrement = viewModel::incrementCount,
                onDecrement = viewModel::decrementCount
            )
        }
    }
}
```

### ViewModel

```kotlin
@HiltViewModel
class CounterViewModel @Inject constructor(
    private val counterUseCase: CounterUseCase
) : ViewModel() {
    private val _uiState = MutableStateFlow(CounterUiState.Loading)
    val uiState: StateFlow<CounterUiState> = _uiState.asStateFlow()
    init {
        viewModelScope.launch {
            counterUseCase.observeCounter().collect { counter ->
                _uiState.value = CounterUiState.Success(
                    currentCount = counter.count,
                    maxCapacity = counter.capacity
                )
            }
        }
    }
}
```

## Persistencia

### Room

```kotlin
@Entity(tableName = "counters")
data class CounterEntity(
    @PrimaryKey val id: String,
    val count: Int,
    val capacity: Int,
    val lastUpdated: Long,
    val syncStatus: SyncStatus
)
```

### Firebase

```kotlin
class FirebaseCounterDataSource @Inject constructor(
    private val database: FirebaseDatabase
) {
    fun observeCounter(id: String): Flow<CounterDto> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                snapshot.getValue<CounterDto>()?.let { trySend(it) }
            }
        }
        database.reference.child("counters").child(id).addValueEventListener(listener)
        awaitClose {
            database.reference.child("counters").child(id).removeEventListener(listener)
        }
    }
}
```

## Rendimiento

- **Compose**: recomposición optimizada (`derivedStateOf`, claves estables)
- **Hilos**: operaciones de BD fuera del hilo principal
- **Batería**: uso eficiente de red, Doze, y colas

## Pruebas

```kotlin
@Test
fun `increment actualiza almacenamiento local y remoto`() = runTest {
    // Given
    val initialCount = 5
    coEvery { localDataSource.getCounter(counterId) } returns CounterEntity(counterId, initialCount, 100, System.currentTimeMillis())
    // When
    repository.incrementCount(counterId)
    // Then
    coVerify { localDataSource.updateCounter(any()) }
    coVerify { remoteDataSource.updateCounter(counterId, initialCount + 1) }
}
```

CountIn demuestra que patrones modernos de Android pueden manejar requisitos en tiempo real sin sacrificar calidad ni mantenibilidad.


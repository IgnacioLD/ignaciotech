---
title: "CountIn: Modern Android Architecture in Practice"
date: 2024-01-20
tags: ["Android", "Kotlin", "Architecture", "Real-Time", "Firebase"]
categories: ["Android Development", "Architecture"]
description: "Deep dive into the architecture decisions and implementation details of CountIn, a real-time occupancy tracking app"
image: "/images/imported/countin.webp"
---

Building CountIn was an excellent opportunity to implement modern Android architecture patterns in a real-world application. The app's requirements - real-time synchronization, offline capability, and multi-user coordination - provided interesting technical challenges that pushed me to make thoughtful architectural decisions.

## Architecture Overview

CountIn follows clean architecture principles with clear separation of concerns across three main layers:

### Presentation Layer
- **Jetpack Compose** for modern, declarative UI
- **ViewModels** for lifecycle-aware state management
- **Navigation Component** for type-safe screen transitions
- **Hilt** for dependency injection throughout the UI layer

### Domain Layer
- **Use Cases** encapsulating business logic
- **Repository interfaces** defining data contracts
- **Domain models** representing core business entities
- **Event-driven architecture** for real-time updates

### Data Layer
- **Room database** for local persistence
- **Firebase Realtime Database** for cloud synchronization
- **Repository implementations** handling data orchestration
- **WorkManager** for background synchronization

## Real-Time Synchronization Challenges

### Conflict Resolution
Multiple users incrementing/decrementing counts simultaneously required careful conflict resolution:

```kotlin
class CounterRepository {
    suspend fun updateCount(delta: Int) {
        // Optimistic local update
        localDatabase.updateCount(currentCount + delta)
        
        // Firebase transaction for atomic updates
        firebase.runTransaction { snapshot ->
            val currentValue = snapshot.getValue(Int::class.java) ?: 0
            snapshot.ref.setValue(currentValue + delta)
        }
    }
}
```

### Offline-First Design
The app needed to function perfectly without internet connectivity:

- **Local-first operations** with immediate UI feedback
- **Conflict-free replicated data types (CRDTs)** for eventual consistency
- **Automatic sync queues** when connectivity returns
- **Graceful degradation** with clear offline indicators

## State Management

### Reactive UI with Compose
Jetpack Compose's reactive nature paired perfectly with the real-time requirements:

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

### ViewModel Architecture
ViewModels coordinate between UI and business logic while surviving configuration changes:

```kotlin
@HiltViewModel
class CounterViewModel @Inject constructor(
    private val counterUseCase: CounterUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(CounterUiState.Loading)
    val uiState: StateFlow<CounterUiState> = _uiState.asStateFlow()
    
    init {
        viewModelScope.launch {
            counterUseCase.observeCounter()
                .collect { counter ->
                    _uiState.value = CounterUiState.Success(
                        currentCount = counter.count,
                        maxCapacity = counter.capacity
                    )
                }
        }
    }
}
```

## Data Persistence Strategy

### Room Database Design
Local storage uses Room with a simple but effective schema:

```kotlin
@Entity(tableName = "counters")
data class CounterEntity(
    @PrimaryKey val id: String,
    val count: Int,
    val capacity: Int,
    val lastUpdated: Long,
    val syncStatus: SyncStatus
)

@Dao
interface CounterDao {
    @Query("SELECT * FROM counters WHERE id = :id")
    fun observeCounter(id: String): Flow<CounterEntity?>
    
    @Update
    suspend fun updateCounter(counter: CounterEntity)
}
```

### Firebase Integration
Cloud synchronization leverages Firebase Realtime Database for instant updates:

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
        
        database.reference.child("counters").child(id)
            .addValueEventListener(listener)
            
        awaitClose { 
            database.reference.child("counters").child(id)
                .removeEventListener(listener) 
        }
    }
}
```

## Performance Optimizations

### Efficient UI Updates
Real-time updates required careful performance consideration:

- **Compose recomposition optimization** using `derivedStateOf` for computed values
- **List diffing** with stable keys for large counter lists  
- **Background threading** for all database operations
- **Memory leak prevention** with proper lifecycle handling

### Battery Optimization
Long-running usage demanded battery-conscious implementation:

- **Doze mode compatibility** with Firebase's built-in optimizations
- **Background restrictions** awareness with foreground service when needed
- **Network efficiency** through batched updates and connection pooling
- **Wake lock management** for critical synchronization operations

## Testing Strategy

### Comprehensive Test Coverage
The architecture enabled thorough testing at each layer:

```kotlin
@Test
fun `increment counter updates local and remote storage`() = runTest {
    // Given
    val initialCount = 5
    coEvery { localDataSource.getCounter(counterId) } returns 
        CounterEntity(counterId, initialCount, 100, System.currentTimeMillis())
    
    // When
    repository.incrementCount(counterId)
    
    // Then
    coVerify { localDataSource.updateCounter(any()) }
    coVerify { remoteDataSource.updateCounter(counterId, initialCount + 1) }
}
```

### UI Testing with Compose
Jetpack Compose testing made UI verification straightforward:

```kotlin
@Test
fun `counter displays current count and responds to taps`() {
    composeTestRule.setContent {
        CounterScreen()
    }
    
    composeTestRule
        .onNodeWithTag("counter_value")
        .assertTextEquals("0")
        
    composeTestRule
        .onNodeWithTag("increment_button")
        .performClick()
        
    composeTestRule
        .onNodeWithTag("counter_value")
        .assertTextEquals("1")
}
```

## Lessons Learned

### Architecture Benefits
- **Clean separation** made testing and maintenance straightforward
- **Dependency injection** enabled easy mocking and testing
- **Reactive streams** provided natural real-time update handling
- **Modern Android patterns** resulted in robust, maintainable code

### Real-World Challenges
- **Network partition handling** required careful consideration of edge cases
- **User experience during conflicts** needed clear feedback and resolution
- **Performance under load** demanded profiling and optimization
- **Device compatibility** across different Android versions and hardware

## Impact and Results

CountIn successfully demonstrated that modern Android architecture patterns can handle complex real-time requirements while maintaining code quality and developer productivity. The app currently serves events with thousands of attendees, providing reliable occupancy tracking even under high-load conditions.

The project reinforced my belief that investment in proper architecture pays dividends in maintainability, testability, and feature development velocity. It also highlighted the importance of considering real-world usage patterns when making technical decisions.

You can explore the complete implementation on [GitHub](https://github.com/igdel/countin-android) to see how these architectural decisions translate to production code.

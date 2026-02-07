# Diagram Re-creation

Here is the redrawn diagram based on the attached image, using Mermaid.js state diagram syntax.

```mermaid
stateDiagram-v2
    direction TB

    state Happy_Path {
        [*] --> NewState : Return created in Stratos
        
        note right of NewState
            The diagram illustrates the happy path
            for a standard return process in Stratos.
            
            Replacement returns only have
            "new" and "completeSuccessful"
        end note

        NewState --> InitiatedState : Return created with\nSupply Chain
        
        note right of NewState
            The eClaims is called if the
            return does not have the
            eClaims ID. The eClaims ID
            is a required field for the SRS
            to receive the initiated state.
        end note

        InitiatedState --> ProcessingState : carrier request
        
        note right of InitiatedState
            Receive the wRmaNumber (RMA)
            in the initiated payload.
        end note

        state ProcessingState {
            %% Internal logic or just a state
        }
        
        note right of ProcessingState
            The creation of the shipping label
            (FedEx call) is created only after
            the fulfillment is delivered.
            If the fulfillment fails, the
            return will be completeSuccessful.
            
            Chain of information to generate
            Shipping Label (by calling FedEx):
            
            Fulfillment Invoice -> eClaims ID ->
            RMA (wRmaNumber) -> Shipping Label
            
            Timeout is checked only in
            processing state.
        end note
        
        %% Transitions from ProcessingState
        
        ProcessingState --> TimeoutState : Hardware not received\nwithin X days
        ProcessingState --> ItemReceivedState : Hardware received\nin sorting center
        ProcessingState --> ReturnCancelledState : Return is\ncancelled

        %% Timeout Sub-state
        state TimeoutState {
            [*] --> timeout
            
            note left of timeout
                The automatic timeout will occur if the
                return has a "timeoutDays" value.
                
                If "timeoutDays" is null, the return
                will never change to a timeout state
                automatically.
                
                The automatic timeout will change the
                status from processing to timeout if
                the "timeoutDays" is greater than
                the age of return (use the new date
                to calculate the age).
                
                The timeout event trigger returns flow.
            end note

            timeout --> completeTimeout : Item received\nafter timeout
            timeout --> completeUnsuccessful : Item received
        }

        %% ItemReceived Sub-state
        state ItemReceivedState {
            [*] --> itemReceived
            
            itemReceived --> completeSuccessful : If return does not\nneed hardware validation
            itemReceived --> completeSuccessful : If return needs hardware\nvalidation and succeeds
            itemReceived --> completeUnsuccessful : If return needs hardware\nvalidation and fail
        }

        %% ReturnCancelled Sub-state
        state ReturnCancelledState {
            [*] --> cancelled
            
            note right of cancelled
               (Wait on Progress)
               Automatic cancellation if the
               Fulfillment is undelivered
               or lost in transit, and no
               shipping label is created.
            end note

            note left of cancelled
                When receiving "statusComplete" from S4, it will
                be translated to "completeSuccessful" or
                "completeUnsuccessful" based whether the SKU and
                SN match the expected ones.
                
                Returns related to cancellation after the remorse
                period (30 days) do not have the "statusComplete"
                from S4. The latest state will be "returnIncomplete".
            end note
        }
    }
```

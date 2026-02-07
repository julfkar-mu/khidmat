stateDiagram-v2

    state Happy_Path {
        [*] --> new
        
        note right of new
            The diagram illustrates the happy path
            for a standard return process in Stratos.

            Replacement returns only have
            "new" and "completeSuccessful".
        end note

        new --> initiated : Return created in Stratos

        note right of initiated
            The eClaims is called if the
            return does not have the
            eClaims ID. The eClaims ID
            is a required field for the SRS
            to receive the initiated state.
        end note

        initiated --> processing : Return created with Supply Chain
        
        %% Global Refurb returns - Dotted line from processing back to initiated?
        %% The image shows a dotted line curving back.
        processing -.-> initiated : Global Refurb returns

        note right of processing
            The automatic timeout will occur if the
            return has a "timeoutInDays" value.

            If "timeoutInDays" is null, the return
            will never change to a timeout state
            automatically.
            
            (Note: This text actually belongs to timeout, correcting based on image positions)
            
            The creation of the shipping label
            (FedEx call) is created only after
            the fullfillment is delivered.
            If the fullfillment fails, the
            return will be completeSuccessful.

            Chain of information to generate
            Shipping Label (by calling FedEx):
            
            Fullfillment Invoice -> eClaims ID ->
            RMA (refReturnNumber) -> Shipping Label

            Timeout is checked only in
            processing state.
        end note

        processing --> ItemReceived : Hardware received in sorting center
        
        %% ReturnCanceled Group
        state ReturnCanceled {
             [*] --> canceled
             note right of canceled
                [Waiton in Progress]
                Automatic cancellation if the
                Fullfillment is undelivered
                or lost in transit, and no
                shipping label is created.
             end note
        }
        
        initiated --> canceled : If return is cancelled
        processing --> canceled : If return is cancelled

        state ItemReceived {
            %% Just a state label for visualization if needed, but here it acts as a state
        }
        
        ItemReceived --> completeSuccessful : If return does not need hardware validation
        ItemReceived --> completeUnsuccessful : If return needs hardware validation and fail
        ItemReceived --> completeSuccessful : If return needs hardware validation and success


        %% Timeout Group
        state Timeout {
            timeout --> completeTimeout : Item received after timeout
            
            note left of timeout
                The automatic timeout will occur if the
                return has a "timeoutInDays" value.

                If "timeoutInDays" is null, the return
                will never change to a timeout state
                automatically.

                The automatic timeout will change the
                status from processing to timeout if
                the "timeoutInDays" is greater than
                the age of return (use the new state
                to calculate the age).

                The timeout event trigger returns here.
            end note
        }
        
        processing --> timeout : Hardware not received within X days
    }
    
    note bottom of Happy_Path
        When receiving "statusComplete" from S4, it will
        be translated to "completeSuccessful" or
        "completeUnsuccessful" based whether the SKU and
        SN match the expected ones.

        Returns related to cancellation after the coverage
        period (30 days) do not have the "statusComplete"
        from S4. The latest state will be "ItemReceived".
    end note
